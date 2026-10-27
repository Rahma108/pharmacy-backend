import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SalesAnalyticsQueryDto } from './dto/sales-analytics-query.dto';

@Injectable()
export class SalesAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private getDateFilter(query: SalesAnalyticsQueryDto) {
    const { startDate, endDate } = query;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'startDate must be before or equal to endDate',
      );
    }

    const createdAt: {
      gte?: Date;
      lt?: Date;
    } = {};

    if (startDate) {
      createdAt.gte = new Date(startDate);
    }

    if (endDate) {
      // Include the entire end date when the input is YYYY-MM-DD.
      const end = new Date(endDate);

      if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        end.setUTCDate(end.getUTCDate() + 1);
        createdAt.lt = end;
      } else {
        // A full ISO timestamp is treated as an exclusive upper bound.
        createdAt.lt = end;
      }
    }

    return Object.keys(createdAt).length ? { createdAt } : {};
  }

  async getSummary(query: SalesAnalyticsQueryDto) {
    const where = {
      deletedAt: null,
      ...this.getDateFilter(query),
    };

    const [summary, count] = await Promise.all([
      this.prisma.sale.aggregate({
        where,
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      message: 'Sales summary retrieved successfully',
      data: {
        totalRevenue: Number(summary._sum.totalAmount ?? 0),
        totalSales: count,
        averageSaleValue: Number(summary._avg.totalAmount ?? 0),
      },
    };
  }

  async getTopSellingMedicines(query: SalesAnalyticsQueryDto) {
    const limit = query.limit ?? 10;
    const saleFilter = {
      deletedAt: null,
      ...this.getDateFilter(query),
    };

    const grouped = await this.prisma.saleItem.groupBy({
      by: ['medicineId'],
      where: {
        sale: { is: saleFilter },
        medicine: { is: { deletedAt: null } },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take: limit,
    });

    const medicines = await this.prisma.medicine.findMany({
      where: {
        id: { in: grouped.map((item) => item.medicineId) },
      },
      select: {
        id: true,
        name: true,
        barcode: true,
      },
    });

    const medicineMap = new Map(
      medicines.map((medicine) => [medicine.id, medicine]),
    );

    return {
      message: 'Top-selling medicines retrieved successfully',
      data: grouped.map((item) => ({
        medicine: medicineMap.get(item.medicineId),
        quantitySold: item._sum.quantity ?? 0,
        revenue: Number(item._sum.totalPrice ?? 0),
      })),
    };
  }

  async getTrends(query: SalesAnalyticsQueryDto) {
    const sales = await this.prisma.sale.findMany({
      where: {
        deletedAt: null,
        ...this.getDateFilter(query),
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const daily = new Map<
      string,
      { totalRevenue: number; totalSales: number }
    >();

    for (const sale of sales) {
      const date = sale.createdAt.toISOString().slice(0, 10);
      const current = daily.get(date) ?? {
        totalRevenue: 0,
        totalSales: 0,
      };

      current.totalRevenue += Number(sale.totalAmount);
      current.totalSales += 1;
      daily.set(date, current);
    }

    return {
      message: 'Sales trends retrieved successfully',
      data: Array.from(daily.entries()).map(([date, values]) => ({
        date,
        ...values,
      })),
    };
  }
}