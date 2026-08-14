import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { RedisModule } from './redis.module';

import {
  CacheService,
  EmailService,
  SecurityService,
} from 'src/utils/service';

@Global()
@Module({
  imports: [
    JwtModule.register({}),
    RedisModule,
  ],

  providers: [
    CacheService,
    EmailService,
    SecurityService,
    
  ],

  exports: [
    CacheService,
    EmailService,
    SecurityService,

  ],
})
export class CommonModule {}