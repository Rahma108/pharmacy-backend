
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import {
  ConfirmEmailDTO,
  LoginDTO,
  ResendConfirmEmailDto,
  ResetForgotPasswordDTO,
  SignupDTO,
  VerifyEmailDTO,
} from './dto/create-auth.dto';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // =====================================================
  // Signup
  // =====================================================

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() body: SignupDTO,
  ) {
    return this.authService.register(body);
  }

  // =====================================================
  // Login
  // =====================================================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDTO,
  ) {
    return this.authService.login(body);
  }

  // =====================================================
  // Confirm Email
  // =====================================================

  @Patch('confirm-email')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(
    @Body() body: ConfirmEmailDTO,
  ) {
    return this.authService.confirmEmail(body);
  }

  // =====================================================
  // Resend Confirmation Email
  // =====================================================

  @Patch('resend-confirm-email')
  @HttpCode(HttpStatus.OK)
  async resendConfirmEmail(
    @Body() body: ResendConfirmEmailDto,
  ) {
    return this.authService.resendVerificationEmail(
      body.email,
    );
  }

  // =====================================================
  // Request Forgot Password OTP
  // =====================================================

  @Post('request-forgot-password-code')
  @HttpCode(HttpStatus.OK)
  async requestForgotPasswordCode(
    @Body() body: VerifyEmailDTO,
  ) {
    return this.authService.forgotPassword(
      body.email,
    );
  }

  // =====================================================
  // Verify Forgot Password OTP
  // =====================================================

  @Patch('verify-forgot-password-code')
  @HttpCode(HttpStatus.OK)
  async verifyForgotPasswordCode(
    @Body() body: ConfirmEmailDTO,
  ) {
    return this.authService.verifyForgotPasswordOtp(
      body,
    );
  }

  // =====================================================
  // Reset Password
  // =====================================================

  @Patch('reset-forgot-password-code')
  @HttpCode(HttpStatus.OK)
  async resetForgotPasswordCode(
    @Body() body: ResetForgotPasswordDTO,
  ) {
    return this.authService.resetPassword(body);
  }
}

