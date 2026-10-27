
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiReorderService {
  private readonly SALES_WINDOW_DAYS = 30;
  private readonly LEAD_TIME_DAYS = 7;
  private readonly SAFETY_STOCK_DAYS = 7;
  private readonly TARGET_STOCK_DAYS = 14;

  // Minimum thresholds used when sales history is limited.
  private readonly MIN_REORDER_POINT_UNITS = 7;
  private readonly MIN_TARGET_STOCK_UNITS = 14;

  constructor(private readonly prisma: PrismaService) {}

  async getSuggestions() {
    const now = new Date();

    const salesStartDate = new Date(now);
    salesStartDate.setDate(
      salesStartDate.getDate() - this.SALES_WINDOW_DAYS,
    );

    const sales = await this.prisma.saleItem.groupBy({
      by: ['medicineId'],
      where: {
        sale: {
          is: {
            createdAt: {
              gte: salesStartDate,
              lte: now,
            },
            deletedAt: null,
          },
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const soldQuantities = new Map<number, number>();

    for (const sale of sales) {
      soldQuantities.set(
        sale.medicineId,
        sale._sum.quantity ?? 0,
      );
    }

    const medicines = await this.prisma.medicine.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        category: true,
      },
      orderBy: {
        stock: 'asc',
      },
    });

    const suggestions = medicines.map((medicine) => {
      const soldLast30Days =
        soldQuantities.get(medicine.id) ?? 0;

      const averageDailySales =
        soldLast30Days / this.SALES_WINDOW_DAYS;

      const calculatedSafetyStock =
        averageDailySales * this.SAFETY_STOCK_DAYS;

      const calculatedReorderPoint =
        averageDailySales * this.LEAD_TIME_DAYS +
        calculatedSafetyStock;

      // Do not let low sales history hide low-stock medicines.
      const reorderPoint = Math.max(
        Math.ceil(calculatedReorderPoint),
        this.MIN_REORDER_POINT_UNITS,
      );

      const targetStock = Math.max(
        Math.ceil(
          averageDailySales * this.TARGET_STOCK_DAYS,
        ),
        this.MIN_TARGET_STOCK_UNITS,
      );

      const isCriticalStock = medicine.stock <= 0;

      const needsReorder =
        isCriticalStock ||
        medicine.stock <= reorderPoint;

      const suggestedQuantity = needsReorder
        ? Math.max(0, targetStock - medicine.stock)
        : 0;

      let reason: string;

      if (medicine.stock < 0) {
        reason =
          'Stock is negative. Reconcile inventory records urgently before placing an order.';
      } else if (medicine.stock === 0) {
        reason =
          'Out of stock. Verify inventory and replenish as appropriate.';
      } else if (soldLast30Days === 0 && needsReorder) {
        reason =
          'Stock is below the minimum threshold, but there are no recorded sales in the last 30 days. Review demand before ordering.';
      } else if (needsReorder) {
        reason =
          'Current stock is at or below the estimated reorder point based on recent sales.';
      } else {
        reason =
          'Current stock is above the estimated reorder point.';
      }

      return {
        medicineId: medicine.id,
        medicineName: medicine.name,
        category: medicine.category.name,
        currentStock: medicine.stock,
        soldLast30Days,
        averageDailySales: Number(
          averageDailySales.toFixed(2),
        ),
        reorderPoint,
        targetStock,
        suggestedQuantity,
        needsReorder,
        stockStatus: isCriticalStock
          ? 'CRITICAL'
          : needsReorder
            ? 'LOW'
            : 'SUFFICIENT',
        reason,
      };
    });

    const reorderSuggestions = suggestions.filter(
      (item) => item.needsReorder,
    );

    return {
      generatedAt: now,
      salesWindowDays: this.SALES_WINDOW_DAYS,
      leadTimeDays: this.LEAD_TIME_DAYS,
      targetStockDays: this.TARGET_STOCK_DAYS,
      minimumReorderPointUnits:
        this.MIN_REORDER_POINT_UNITS,
      minimumTargetStockUnits:
        this.MIN_TARGET_STOCK_UNITS,
      totalMedicines: suggestions.length,
      medicinesToReorder: reorderSuggestions.length,
      criticalMedicines: reorderSuggestions.filter(
        (item) => item.stockStatus === 'CRITICAL',
      ).length,
      suggestions: reorderSuggestions,
    };
  }
}
