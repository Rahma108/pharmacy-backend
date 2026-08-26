import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from 'src/common/repository';
import { InventoryQueryDto } from './dto/inventory-query.dto';

@Injectable()
export class InventoryRepository extends BaseRepository<
  Prisma.InventoryTransactionGetPayload<{}>,
  number,
  Prisma.InventoryTransactionCreateInput,
  Prisma.InventoryTransactionUpdateInput
> {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.inventoryTransaction);
  }
  async paginateTransactions(
    query: InventoryQueryDto,
  ) {
    const {
      page,
      limit,
      medicineId,
      type,
    } = query;

    return this.paginate({
      page,
      limit,

      where: {
        ...(medicineId
          ? { medicineId }
          : {}),

        ...(type
          ? { type }
          : {}),
      },

      orderBy: {
        createdAt: 'desc',
      },

      include: {
        medicine: true,
        supplier: true,
      },
    });
  }

  async findMedicineById(id: number) {
    return this.prisma.medicine.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findSupplierById(id: number) {
    return this.prisma.supplier.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }
}