
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SalesRepository } from './sales.repository';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    SalesController,
  ],

  providers: [
    SalesService,
    SalesRepository,
  ],

  exports: [
    SalesService,
    SalesRepository,
  ],
})
export class SalesModule {}
