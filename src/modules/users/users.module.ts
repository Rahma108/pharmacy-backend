import { Module, forwardRef } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './user.repository';
import { AuthenticationGuard, AuthorizationGuard } from 'src/common/guard';

@Module({
  imports: [
    CommonModule,
    forwardRef(() => AuthModule),
  ],

  controllers: [UsersController],

  providers: [
    UsersService,
    UserRepository,
    AuthenticationGuard,
    AuthorizationGuard,
  ],

  exports: [
    UserRepository,
  ],
})
export class UsersModule {}