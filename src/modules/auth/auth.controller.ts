
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Headers
} from '@nestjs/common';

import { AuthService } from './auth.service';

import {
  ConfirmEmailDTO,
  LoginDTO,
  ResetForgotPasswordDTO,
  VerifyEmailDTO,
} from './dto/create-auth.dto';
import { Credentials } from 'src/common/decorator/credentials.decorator';
import { Auth } from 'src/common/decorator';
import { RoleEnum } from 'src/common/enum';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // 
  // Login
  // 

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDTO,
  ) {
    return this.authService.login(body);
  }

@Post('refresh-token')
refreshToken(
  @Headers('authorization')
  authorization: string,
) {
  const refreshToken =
    authorization.replace(
      'Bearer ',
      '',
    );

  return this.authService.refreshToken(
    refreshToken,
  );
}
@Post('logout')
@Auth([
  RoleEnum.ADMIN,
  RoleEnum.PHARMACIST,
  RoleEnum.EMPLOYEE,
])
logout(
  @Credentials() { user }: any,
) {
  return this.authService.logout(
    user.id,
  );
}
  // 
  // Request Forgot Password OTP
  // 

  @Post('request-forgot-password-code')
  @HttpCode(HttpStatus.OK)
  async requestForgotPasswordCode(
    @Body() body: VerifyEmailDTO,
  ) {
    return this.authService.forgotPassword(
      body.email,
    );
  }

  // 
  // Verify Forgot Password OTP
  // 

  @Patch('verify-forgot-password-code')
  @HttpCode(HttpStatus.OK)
  async verifyForgotPasswordCode(
    @Body() body: ConfirmEmailDTO,
  ) {
    return this.authService.verifyForgotPasswordOtp(
      body,
    );
  }

  // 
  // Reset Password
  // 

  @Patch('reset-forgot-password-code')
  @HttpCode(HttpStatus.OK)
  async resetForgotPasswordCode(
    @Body() body: ResetForgotPasswordDTO,
  ) {
    return this.authService.resetPassword(body);
  }
}

