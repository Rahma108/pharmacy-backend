import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from 'src/utils/service';
@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    TokenService,
  ],

  exports: [
    AuthService,
  ],
})

export class AuthModule {}