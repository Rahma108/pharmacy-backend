
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from 'src/common/repository';
import { SaleQueryDto } from './dto/sale-query.dto';

@Injectable()
export class SalesRepository extends BaseRepository<
  Prisma.SaleGetPayload<{}>,
  number,
  Prisma.SaleCreateInput,
  Prisma.SaleUpdateInput
> {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.sale);
  }

  async paginateSales(query: SaleQueryDto) {
    const { page, limit, userId } = query;

    return this.paginate({
      page,
      limit,

      where: {
        deletedAt: null,
        ...(userId ? { userId } : {}),
      },

      orderBy: {
        createdAt: 'desc',
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        items: {
          include: {
            medicine: true,
          },
        },
      },
    });
  }

  async findSaleById(id: number) {
    return this.prisma.sale.findUnique({
      where: { id },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        items: {
          include: {
            medicine: true,
          },
        },
      },
    });
  }
}
