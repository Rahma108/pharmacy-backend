
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ReportsModule } from '../reports/reports.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ReportsModule , AuthModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
