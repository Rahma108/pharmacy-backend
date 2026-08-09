import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from 'src/common/repository';
import { MedicineQueryDto } from './dto/medicine-query.dto';

@Injectable()
export class MedicineRepository extends BaseRepository<
  Prisma.MedicineGetPayload<{}>,
  number,
  Prisma.MedicineCreateInput,
  Prisma.MedicineUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.medicine);
  }

  async paginateMedicines(query: MedicineQueryDto) {
  const {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  } = query;

  return this.paginate({
    page,
    limit,

    where: {
      deletedAt: null,

      ...(search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {}),
    },

    orderBy: {
      [sortBy]: sortOrder,
    },
  });
}

  async softDelete(id: number) {
  return this.prisma.medicine.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

  async restore(id: number) {
  return this.prisma.medicine.update({
    where: { id },
    data: {
      deletedAt: null,
    },
  });
}

  async findActiveById(id: number) {
    return this.prisma.medicine.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
}
}