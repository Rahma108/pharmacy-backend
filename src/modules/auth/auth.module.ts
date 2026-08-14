import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from 'src/utils/service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({}),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    TokenService,
  ],

  exports: [
    AuthService,
    TokenService,
  ],
})
export class AuthModule {}