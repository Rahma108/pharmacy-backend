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
}