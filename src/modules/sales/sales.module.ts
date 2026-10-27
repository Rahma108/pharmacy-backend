
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SalesRepository } from './sales.repository';
import { SalesAnalyticsService } from './sales-analytics.service';
import { SalesAnalyticsController } from './sales-analytics.controller';

@Module({
  imports: [
    AuthModule,
  ],

    controllers: [
    SalesController,
    SalesAnalyticsController,
  ],

  providers: [
    SalesService,
    SalesRepository,
    SalesAnalyticsService,
  ],

  exports: [
    SalesService,
    SalesRepository,
  ],
})
export class SalesModule {}
