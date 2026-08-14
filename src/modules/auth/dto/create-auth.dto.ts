import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  Matches,
  ValidateIf,
} from 'class-validator';
import { IsMatch } from 'src/common/decorator/index';

export class CreateAuthDto {}
export class ResendConfirmEmailDto  {
  @IsEmail({} , { message: 'Please Enter your email' })
  email!: string;
}

export class ConfirmEmailDTO extends ResendConfirmEmailDto{
  @Matches(/^\d{6}$/)
  otp! : string;



}
export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
 
  @IsStrongPassword()
  password!: string;

  FCM?: string;
}
export class VerifyEmailDTO {
  @IsEmail({}, { message: 'Please enter your email' })
  email!: string;
}

export class VerifyForgotPasswordDTO extends VerifyEmailDTO {
  @Matches(/^\d{6}$/, {
    message: 'OTP must be 6 digits',
  })
  otp!: string;
}
export class ResetForgotPasswordDTO extends ConfirmEmailDTO {
  @IsStrongPassword({}, {
    message: 'Password is not strong enough',
  })
  password!: string;

  @ValidateIf((o) => o.password !== undefined)
  @IsMatch('password', {
    message: 'Passwords do not match',
  })
  confirmPassword!: string;
}
