import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Category } from '@prisma/client';
import { BaseRepository } from 'src/common/repository';

@Injectable()
export class CategoryRepository extends BaseRepository<
  Category,
  number,
  { name: string },
  { name?: string }
> {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.category);
  }

   async findActive() {
    return this.prisma.category.findMany({
      where: {
        deletedAt: null,
      },
    });
}
  async findByName(name: string) {
    return this.prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async findByIdWithMedicines(id: number) {
    return this.prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        medicines: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  async countMedicines(id: number) {
    return this.prisma.medicine.count({
      where: {
        categoryId: id,
        deletedAt: null,
      },
    });
  }


  async softDelete(id: number) {
  return this.prisma.category.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}

async restore(id: number) {
  return this.prisma.category.update({
    where: {
      id,
    },
    data: {
      deletedAt: null,
    },
  });
}

async permanentDelete(id: number) {
  return this.prisma.category.delete({
    where: {
      id,
    },
  });
}
}