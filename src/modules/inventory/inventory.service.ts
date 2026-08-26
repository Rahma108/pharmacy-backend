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
              stock: data.quantity,
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
}