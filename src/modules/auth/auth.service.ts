import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { EmailEnum, TokenTypeEnum } from 'src/common/enum';
import { emailEmitter } from 'src/common/events';

import {
  CacheService,
  EmailService,
  TokenService,
} from 'src/utils/service';

import { createNumberOtp } from 'src/utils/otp';
import { UserRepository } from 'src/modules/users/user.repository';

import {
  ConfirmEmailDTO,
  LoginDTO,
  ResetForgotPasswordDTO,
} from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
    private readonly redis: CacheService,
  ) {}

  // 
  // Generate + Send OTP
  // 

  private async sendOtp(
    email: string,
    type: EmailEnum,
    title: string,
  ): Promise<void> {
    const blockKey = this.redis.otpBlockKey({
      email,
      type,
    });

    const otpKey = this.redis.otpKey({
      email,
      type,
    });

    const requestKey = this.redis.otpMaxRequestKey({
      email,
      type,
    });

    // 
    // Check temporary block
    // 

    const blockTTL = await this.redis.ttl(blockKey);

    if (blockTTL > 0) {
      throw new ConflictException(
        `Too many OTP requests. Try again after ${blockTTL} seconds.`,
      );
    }

    // 
    // Check existing OTP
    // 

    const otpTTL = await this.redis.ttl(otpKey);

    if (otpTTL > 0) {
      throw new ConflictException(
        `Please wait ${otpTTL} seconds before requesting another OTP.`,
      );
    }

    // 
    // Check maximum requests
    // 

    const requestCount = Number(
      (await this.redis.get<number>(requestKey)) ?? 0,
    );

    if (requestCount >= 3) {
      await this.redis.set({
        key: blockKey,
        value: true,
        ttl: 300,
      });

      throw new ConflictException(
        'Maximum OTP requests reached. Try again after 5 minutes.',
      );
    }

    // 
    // Generate OTP
    // 

    const code = await createNumberOtp();

    // 
    // Hash OTP
    // 

    const hashedOtp = await bcrypt.hash(
      code.toString(),
      10,
    );

    // 
    // Store OTP in Redis for 2 minutes
    // 

    await this.redis.set({
      key: otpKey,
      value: hashedOtp,
      ttl: 120,
    });

    // 
    // Send Email
    // 

    await this.emailService.sendEmail({
      to: email,
      subject: title,
      html: this.emailService.emailTemplate({
        code,
        title,
      }),
    });

    // 
    // Increase request count
    // 

    if (requestCount > 0) {
      await this.redis.increment(requestKey);
    } else {
      await this.redis.set({
        key: requestKey,
        value: 1,
        ttl: 300,
      });
    }
  }

  // Login
  async login(data: LoginDTO) {
  const user =
    await this.userRepository.findByEmail(
      data.email,
    );

  if (!user) {
    throw new UnauthorizedException(
      'Invalid email or password.',
    );
  }

  if (!user.isVerified) {
    throw new UnauthorizedException(
      'Please verify your email first.',
    );
  }

  const isPasswordValid =
    await bcrypt.compare(
      data.password,
      user.password,
    );

  if (!isPasswordValid) {
    throw new UnauthorizedException(
      'Invalid email or password.',
    );
  }

  const tokens =
    await this.tokenService.createLoginCredentials(
      user,
      'pharmacy-api',
    );


    const refreshTokenHash =
      await bcrypt.hash(
        tokens.refresh_token,
        10,
      );

    await this.userRepository.update(
      user.id,
      {
        refreshTokenHash,
      },
    );

  const {
    password,
    ...safeUser
  } = user;

  return {
    message: 'Login successful. ✅',
    data: {
      user: safeUser,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    },
  };
}


// =========================
// Refresh Token
// =========================

async refreshToken(
  refreshToken: string,
) {
  const { user } =
    await this.tokenService.decodeToken({
      token: refreshToken,
      tokenType: TokenTypeEnum.refresh,
    });

  if (!user.refreshTokenHash) {
    throw new UnauthorizedException(
      'Please login again.',
    );
  }

  const isValid =
    await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

  if (!isValid) {
    throw new UnauthorizedException(
      'Invalid refresh token.',
    );
  }

  const tokens =
    await this.tokenService.createLoginCredentials(
      user,
      'pharmacy-api',
    );

  const refreshTokenHash =
    await bcrypt.hash(
      tokens.refresh_token,
      10,
    );

  await this.userRepository.update(
    user.id,
    {
      refreshTokenHash,
    },
  );

  return {
    message:
      'Token refreshed successfully. ✅',
    data: tokens,
  };
}

// =========================
// Logout
// =========================

async logout(
  userId: number,
) {
  await this.userRepository.update(
    userId,
    {
      refreshTokenHash: null,
    },
  );

  return {
    message:
      'Logged out successfully. ✅',
  };
}

  // 
  // Forgot Password - Request OTP
  // 

  async forgotPassword(
    email: string,
  ): Promise<void> {
    const user =
      await this.userRepository.findByEmail(
        email,
      );

    if (!user) {
      throw new NotFoundException(
        'Account not found.',
      );
    }

    if (!user.isVerified) {
      throw new BadRequestException(
        'Please verify your email first.',
      );
    }

    emailEmitter.emit(
      'sendEmail',
      async () => {
        await this.sendOtp(
          email,
          EmailEnum.ForgotPassword,
          'Reset Password',
        );
      },
    );
  }

  // 
  // Verify Forgot Password OTP
  // 

  async verifyForgotPasswordOtp(
    data: ConfirmEmailDTO,
  ): Promise<void> {
    const otpKey =
      this.redis.otpKey({
        email: data.email,
        type: EmailEnum.ForgotPassword,
      });

    const hashedOtp =
      await this.redis.get<string>(otpKey);

    if (!hashedOtp) {
      throw new BadRequestException(
        'OTP expired or does not exist.',
      );
    }

    const isValid =
      await bcrypt.compare(
        data.otp.toString(),
        hashedOtp,
      );

    if (!isValid) {
      throw new BadRequestException(
        'Invalid OTP.',
      );
    }
  }

  // 
  // Reset Password
  // 

  async resetPassword(
    data: ResetForgotPasswordDTO,
  ): Promise<{ message: string }> {
    // Verify OTP first
    await this.verifyForgotPasswordOtp({
      email: data.email,
      otp: data.otp,
    });

    const user =
      await this.userRepository.findByEmail(
        data.email,
      );

    if (!user) {
      throw new NotFoundException(
        'Account not found.',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        data.password,
        10,
      );

    await this.userRepository.update(
      user.id,
      {
        password: hashedPassword,
        refreshTokenHash: null,
      },
    );

    // Delete OTP
    await this.redis.deleteKeys(
      this.redis.otpKey({
        email: data.email,
        type: EmailEnum.ForgotPassword,
      }),
    );

    return {
      message:
        'Password reset successfully.',
    };
  }
}