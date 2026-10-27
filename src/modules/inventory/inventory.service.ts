import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { InventoryRepository } from './inventory.repository';

import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async findAll(query: InventoryQueryDto) {
    const data =
      await this.inventoryRepository.paginateTransactions(
        query,
      );

    return {
      message: 'Inventory transactions retrieved successfully',
      data,
    };
  }

  async stockIn(data: StockInDto) {
    const medicine =
      await this.inventoryRepository.findMedicineById(
        data.medicineId,
      );

    if (!medicine) {
      throw new NotFoundException(
        'Medicine not found ❕',
      );
    }

    const supplier =
      await this.inventoryRepository.findSupplierById(
        data.supplierId,
      );

    if (!supplier) {
      throw new NotFoundException(
        'Supplier not found ❕',
      );
    }

    const result = await this.prisma.$transaction(
      async (tx) => {
        const updatedMedicine =
          await tx.medicine.update({
            where: {
              id: data.medicineId,
            },
            data: {
              stock: {
                increment: data.quantity,
              },
            },
          });

        const transaction =
          await tx.inventoryTransaction.create({
            data: {
              medicine: {
                connect: {
                  id: data.medicineId,
                },
              },

              supplier: {
                connect: {
                  id: data.supplierId,
                },
              },

              type: 'STOCK_IN',
              quantity: data.quantity,
              unitPrice: data.unitPrice,
              reason: data.reason,
              notes: data.notes,
            },
          });

        return {
          updatedMedicine,
          transaction,
        };
      },
    );

    return {
      message: 'Stock added successfully',
      data: result,
    };
  }

  async stockOut(data: StockOutDto) {
    const medicine =
      await this.inventoryRepository.findMedicineById(
        data.medicineId,
      );

    if (!medicine) {
      throw new NotFoundException(
        'Medicine not found ❕',
      );
    }

    if (medicine.stock < data.quantity) {
      throw new BadRequestException(
        'Insufficient stock ❕',
      );
    }

    const result = await this.prisma.$transaction(
      async (tx) => {
        const updatedMedicine =
          await tx.medicine.update({
            where: {
              id: data.medicineId,
            },
            data: {
              stock: {
                decrement: data.quantity,
              },
            },
          });

        const transaction =
          await tx.inventoryTransaction.create({
            data: {
              medicine: {
                connect: {
                  id: data.medicineId,
                },
              },

              type: 'STOCK_OUT',
              quantity: data.quantity,
              reason: data.reason,
              notes: data.notes,
            },
          });

        return {
          updatedMedicine,
          transaction,
        };
      },
    );

    return {
      message: 'Stock removed successfully',
      data: result,
    };
  }

  async adjust(data: StockAdjustmentDto) {
    const medicine =
      await this.inventoryRepository.findMedicineById(
        data.medicineId,
      );

    if (!medicine) {
      throw new NotFoundException(
        'Medicine not found ❕',
      );
    }

    const newStock =
      medicine.stock + data.quantity;

    if (newStock < 0) {
      throw new BadRequestException(
        'Stock cannot be negative ❕',
      );
    }

    const result = await this.prisma.$transaction(
      async (tx) => {
        const updatedMedicine =
          await tx.medicine.update({
            where: {
              id: data.medicineId,
            },
            data: {
              stock: newStock,
            },
          });

        const transaction =
          await tx.inventoryTransaction.create({
            data: {
              medicine: {
                connect: {
                  id: data.medicineId,
                },
              },

              type: 'ADJUSTMENT',
              quantity: data.quantity,
              reason: data.reason,
              notes: data.notes,
            },
          });

        return {
          updatedMedicine,
          transaction,
        };
      },
    );

    return {
      message: 'Stock adjusted successfully',
      data: result,
    };
  }



async predictLowStock() {
  const historyDays = 30;
  const leadTimeDays = 7;
  const safetyStockDays = 7;
  const targetStockDays = 14;

  const minimumReorderPointUnits = 7;
  const minimumTargetStockUnits = 14;

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - historyDays);

  const medicines = await this.prisma.medicine.findMany({
    where: { deletedAt: null },
    include: {
      category: { select: { name: true } },
      saleItems: {
        where: {
          sale: {
            is: {
              deletedAt: null,
              createdAt: {
                gte: startDate,
                lte: now,
              },
            },
          },
        },
        select: { quantity: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const predictions = medicines.map((medicine) => {
    const totalSold = medicine.saleItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const averageDailySales = totalSold / historyDays;

    const reorderPoint = Math.max(
      Math.ceil(
        averageDailySales * (leadTimeDays + safetyStockDays),
      ),
      minimumReorderPointUnits,
    );

    const targetStock = Math.max(
      Math.ceil(averageDailySales * targetStockDays),
      minimumTargetStockUnits,
    );

    const needsReorder =
      medicine.stock <= 0 || medicine.stock <= reorderPoint;

    const daysUntilStockOut =
      averageDailySales > 0 && medicine.stock >= 0
        ? Number(
            (medicine.stock / averageDailySales).toFixed(1),
          )
        : null;

    let status: string;
    let suggestedReorderQuantity = 0;
    let reason: string;

    if (medicine.stock < 0) {
      status = 'INVALID_STOCK';
      reason =
        'Stock is negative. Reconcile inventory records before ordering.';
    } else if (medicine.stock === 0) {
      status = 'OUT_OF_STOCK';
      reason = 'Medicine is out of stock.';
      suggestedReorderQuantity = Math.max(
        0,
        targetStock - medicine.stock,
      );
    } else if (needsReorder) {
      status = 'LOW_STOCK';
      reason =
        'Current stock is at or below the estimated reorder point.';
      suggestedReorderQuantity = Math.max(
        0,
        targetStock - medicine.stock,
      );
    } else if (averageDailySales === 0) {
      status = 'NO_SALES_HISTORY';
      reason =
        'No sales recorded in the last 30 days. Review demand before reordering.';
    } else {
      status = 'NORMAL';
      reason = 'Current stock is above the estimated reorder point.';
    }

    return {
      medicineId: medicine.id,
      name: medicine.name,
      category: medicine.category.name,
      currentStock: medicine.stock,
      totalSoldLast30Days: totalSold,
      averageDailySales: Number(averageDailySales.toFixed(2)),
      reorderPoint,
      targetStock,
      daysUntilStockOut,
      suggestedReorderQuantity,
      needsReorder,
      status,
      reason,
    };
  });

  return {
    message: 'Low-stock prediction generated successfully',
    data: {
      historyDays,
      leadTimeDays,
      safetyStockDays,
      targetStockDays,
      minimumReorderPointUnits,
      minimumTargetStockUnits,
      totalMedicines: predictions.length,
      medicinesToReorder: predictions.filter(
        (item) => item.needsReorder && item.currentStock >= 0,
      ).length,
      criticalMedicines: predictions.filter(
        (item) =>
          item.status === 'OUT_OF_STOCK' ||
          item.status === 'INVALID_STOCK',
      ).length,
      predictions,
    },
  };
}


}