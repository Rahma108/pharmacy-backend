
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ReportsRepository } from './reports.repository';


@Injectable()
export class ReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
  ) {}

  async getInventoryStatus(threshold = 10) {
    if (
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {
      throw new BadRequestException(
        'Threshold must be a non-negative integer',
      );
    }

    const data =
      await this.reportsRepository.getInventoryStatus(
        threshold,
      );

    return {
      message: 'Inventory status report retrieved successfully',
      data: {
        threshold,
        totalMedicines: data.totalMedicines,
        lowStockCount: data.lowStockMedicines.length,
        outOfStockCount: data.outOfStockMedicines.length,
        lowStockMedicines: data.lowStockMedicines,
        outOfStockMedicines: data.outOfStockMedicines,
      },
    };
  }

  private buildSalesWhere(
    startDate?: string,
    endDate?: string,
  ): Prisma.SaleWhereInput {
    const createdAt: Prisma.DateTimeFilter = {};

    if (startDate) {
      createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      const exclusiveEndDate = new Date(
        `${endDate}T00:00:00.000Z`,
      );

      exclusiveEndDate.setUTCDate(
        exclusiveEndDate.getUTCDate() + 1,
      );

      createdAt.lt = exclusiveEndDate;
    }

    return {
      deletedAt: null,
      ...(startDate || endDate ? { createdAt } : {}),
    };
  }

  async getSalesSummary(
    startDate?: string,
    endDate?: string,
  ) {
    const sales = await this.reportsRepository.findSales(
      this.buildSalesWhere(startDate, endDate),
    );

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount),
      0,
    );

    const totalItemsSold = sales.reduce(
      (sum, sale) =>
        sum +
        sale.items.reduce(
          (itemSum, item) => itemSum + item.quantity,
          0,
        ),
      0,
    );

    return {
      message: 'Sales summary report retrieved successfully',
      data: {
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        totalSales: sales.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalItemsSold,
        averageSaleValue:
          sales.length > 0
            ? Number((totalRevenue / sales.length).toFixed(2))
            : 0,
      },
    };
  }

  async getTopMedicines(
    limit = 5,
    startDate?: string,
    endDate?: string,
  ) {
    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      throw new BadRequestException(
        'Limit must be an integer between 1 and 100',
      );
    }

    const salesWhere = this.buildSalesWhere(
      startDate,
      endDate,
    );

    const saleItems =
      await this.reportsRepository.findSaleItems({
        sale: {
          is: salesWhere,
        },
      });

    const medicineSales = new Map<
      number,
      { medicineId: number; medicineName: string; quantitySold: number }
    >();

    for (const item of saleItems) {
      const current = medicineSales.get(item.medicineId);

      if (current) {
        current.quantitySold += item.quantity;
      } else {
        medicineSales.set(item.medicineId, {
          medicineId: item.medicineId,
          medicineName: item.medicine.name,
          quantitySold: item.quantity,
        });
      }
    }

    const data = Array.from(medicineSales.values())
      .sort(
        (a, b) =>
          b.quantitySold - a.quantitySold ||
          a.medicineName.localeCompare(b.medicineName),
      )
      .slice(0, limit);

    return {
      message: 'Top-selling medicines report retrieved successfully',
      data: {
        limit,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        medicines: data,
      },
    };
  }

  async getSalesOverTime(
    startDate?: string,
    endDate?: string,
  ) {
    const sales = await this.reportsRepository.findSales(
      this.buildSalesWhere(startDate, endDate),
    );

    const dailySales = new Map<
      string,
      { date: string; salesCount: number; revenue: number }
    >();

    for (const sale of sales) {
      const date = sale.createdAt.toISOString().slice(0, 10);
      const current = dailySales.get(date);

      if (current) {
        current.salesCount += 1;
        current.revenue += Number(sale.totalAmount);
      } else {
        dailySales.set(date, {
          date,
          salesCount: 1,
          revenue: Number(sale.totalAmount),
        });
      }
    }

    const data = Array.from(dailySales.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((day) => ({
        ...day,
        revenue: Number(day.revenue.toFixed(2)),
      }));

    return {
      message: 'Sales over time report retrieved successfully',
      data: {
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        dailySales: data,
      },
    };
  }
}
