import { Controller, Get, Query } from '@nestjs/common';

import { SalesAnalyticsService } from './sales-analytics.service';
import { SalesAnalyticsQueryDto } from './dto/sales-analytics-query.dto';
import { RoleEnum } from 'src/common/enum/user.enum';
import { Auth } from 'src/common/decorator/auth.decorator';

@Controller('reports/sales')
export class SalesAnalyticsController {
  constructor(
    private readonly salesAnalyticsService: SalesAnalyticsService,
  ) {}

  @Get('summary')
  @Auth([RoleEnum.ADMIN, RoleEnum.PHARMACIST])
  getSummary(@Query() query: SalesAnalyticsQueryDto) {
    return this.salesAnalyticsService.getSummary(query);
  }

  @Get('top-medicines')
  @Auth([RoleEnum.ADMIN, RoleEnum.PHARMACIST])
  getTopSellingMedicines(@Query() query: SalesAnalyticsQueryDto) {
    return this.salesAnalyticsService.getTopSellingMedicines(query);
  }

  @Get('trends')
  @Auth([RoleEnum.ADMIN, RoleEnum.PHARMACIST])
  getTrends(@Query() query: SalesAnalyticsQueryDto) {
    return this.salesAnalyticsService.getTrends(query);
  }
}