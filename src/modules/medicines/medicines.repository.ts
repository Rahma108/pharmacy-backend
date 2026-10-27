import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from 'src/common/repository';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { CreateMedicineDto } from './dto/create-medicine.dto';

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

  async createMedicine(data: CreateMedicineDto) {
  const { categoryId, ...medicineData } = data;

  return this.prisma.medicine.create({
    data: {
      ...medicineData,

      category: {
        connect: {
          id: categoryId,
        },
      },
    },

    include: {
      category: true,
    },
  });
}
  async paginateMedicines(query: MedicineQueryDto) {
  const { page, limit, search } = query;

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

    include: {
      category: true,
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


  async findAllWithCategory() {
  return this.prisma.medicine.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      category: true,
    },
  });
}



async findAlternatives(medicine: {
  id: number;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
}) {
  return this.prisma.medicine.findMany({
    where: {
      id: { not: medicine.id },
      deletedAt: null,
      activeIngredient: {
        equals: medicine.activeIngredient,
        mode: 'insensitive',
      },
      strength: {
        equals: medicine.strength,
        mode: 'insensitive',
      },
      dosageForm: {
        equals: medicine.dosageForm,
        mode: 'insensitive',
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

}