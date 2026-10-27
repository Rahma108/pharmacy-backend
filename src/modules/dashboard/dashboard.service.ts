
import { Injectable } from '@nestjs/common';
import { ReportsService } from '../reports/reports.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  async getDashboard(
    threshold = 10,
    limit = 5,
    startDate?: string,
    endDate?: string,
  ) {
    const [
      inventoryReport,
      salesSummaryReport,
      topMedicinesReport,
      salesOverTimeReport,
    ] = await Promise.all([
      this.reportsService.getInventoryStatus(threshold),
      this.reportsService.getSalesSummary(startDate, endDate),
      this.reportsService.getTopMedicines(
        limit,
        startDate,
        endDate,
      ),
      this.reportsService.getSalesOverTime(
        startDate,
        endDate,
      ),
    ]);

    return {
      message: 'Dashboard retrieved successfully',

      data: {
        filters: {
          startDate: startDate ?? null,
          endDate: endDate ?? null,
          threshold,
          limit,
        },

        overview: {
          totalSales: salesSummaryReport.data.totalSales,
          totalRevenue: salesSummaryReport.data.totalRevenue,
          totalItemsSold: salesSummaryReport.data.totalItemsSold,
          averageSaleValue:
            salesSummaryReport.data.averageSaleValue,
        },

        inventory: {
          totalMedicines: inventoryReport.data.totalMedicines,
          lowStockCount: inventoryReport.data.lowStockCount,
          outOfStockCount:
            inventoryReport.data.outOfStockCount,
          lowStockMedicines:
            inventoryReport.data.lowStockMedicines,
          outOfStockMedicines:
            inventoryReport.data.outOfStockMedicines,
        },

        topMedicines: topMedicinesReport.data.medicines,

        salesTrend: salesOverTimeReport.data.dailySales,
      },
    };
  }
}
