
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
  ResetForgotPasswordDTO,
  VerifyEmailDTO,
} from './dto/create-auth.dto';


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

