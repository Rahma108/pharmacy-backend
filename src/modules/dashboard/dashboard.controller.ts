
import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { Auth } from 'src/common/decorator';
import { RoleEnum } from 'src/common/enum';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@Auth([RoleEnum.ADMIN])
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get()
  getDashboard(
    @Query('threshold') threshold?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const parsedThreshold =
      threshold === undefined ? 10 : Number(threshold);

    const parsedLimit =
      limit === undefined ? 5 : Number(limit);

    if (
      !Number.isInteger(parsedThreshold) ||
      parsedThreshold < 0
    ) {
      throw new BadRequestException(
        'Threshold must be a non-negative integer',
      );
    }

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 100
    ) {
      throw new BadRequestException(
        'Limit must be an integer between 1 and 100',
      );
    }

    const isValidDate = (value: string) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }

      const date = new Date(`${value}T00:00:00.000Z`);

      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    };

    if (
      (startDate && !isValidDate(startDate)) ||
      (endDate && !isValidDate(endDate))
    ) {
      throw new BadRequestException(
        'Dates must be valid and use YYYY-MM-DD format',
      );
    }

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'startDate must be before or equal to endDate',
      );
    }

    return this.dashboardService.getDashboard(
      parsedThreshold,
      parsedLimit,
      startDate,
      endDate,
    );
  }
}
