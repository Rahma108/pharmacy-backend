
import {
  Controller,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';

import { ReportsService } from './reports.service';
import { Auth } from 'src/common/decorator';
import { RoleEnum } from 'src/common/enum';

@Controller('reports')
@Auth([RoleEnum.ADMIN])
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  @Get('inventory-status')
  getInventoryStatus(
    @Query('threshold') threshold?: string,
  ) {
    let parsedThreshold = 10;

    if (threshold !== undefined) {
      parsedThreshold = Number(threshold);

      if (
        threshold.trim() === '' ||
        !Number.isInteger(parsedThreshold) ||
        parsedThreshold < 0
      ) {
        throw new BadRequestException(
          'threshold must be a non-negative integer',
        );
      }
    }

    return this.reportsService.getInventoryStatus(
      parsedThreshold,
    );
  }

  @Get('sales-summary')
  getSalesSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.validateDateRange(startDate, endDate);

    return this.reportsService.getSalesSummary(
      startDate,
      endDate,
    );
  }

  @Get('top-medicines')
  getTopMedicines(
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const parsedLimit = limit === undefined ? 5 : Number(limit);

    if (
      limit !== undefined &&
      (
        limit.trim() === '' ||
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 100
      )
    ) {
      throw new BadRequestException(
        'limit must be an integer between 1 and 100',
      );
    }

    this.validateDateRange(startDate, endDate);

    return this.reportsService.getTopMedicines(
      parsedLimit,
      startDate,
      endDate,
    );
  }

  @Get('sales-over-time')
  getSalesOverTime(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.validateDateRange(startDate, endDate);

    return this.reportsService.getSalesOverTime(
      startDate,
      endDate,
    );
  }

  private validateDateRange(
    startDate?: string,
    endDate?: string,
  ) {
    const isValidDate = (value: string) => {
      const date = new Date(value);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    };

    if (
      startDate !== undefined &&
      !isValidDate(startDate)
    ) {
      throw new BadRequestException(
        'startDate must be a valid date in YYYY-MM-DD format',
      );
    }

    if (
      endDate !== undefined &&
      !isValidDate(endDate)
    ) {
      throw new BadRequestException(
        'endDate must be a valid date in YYYY-MM-DD format',
      );
    }

    if (
      startDate &&
      endDate &&
      startDate > endDate
    ) {
      throw new BadRequestException(
        'startDate must be before or equal to endDate',
      );
    }
  }
}
