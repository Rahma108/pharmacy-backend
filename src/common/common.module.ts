import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from './redis.module';
import { CacheService, EmailService} from 'src/utils/service';



@Global()
@Module({
  imports: [
    JwtModule.register({}),
    RedisModule,
  ],

  providers: [
    CacheService,
    EmailService,
  ],

  exports: [
    CacheService,
    EmailService,
  ],
})
export class CommonModule {}