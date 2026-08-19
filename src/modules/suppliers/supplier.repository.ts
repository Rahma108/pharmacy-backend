import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from 'src/common/repository';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';

@Injectable()
export class SupplierRepository extends BaseRepository<
  Prisma.SupplierGetPayload<{}>,
  number,
  Prisma.SupplierCreateInput,
  Prisma.SupplierUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.supplier);
  }

  async createSupplier(data: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data,
    });
  }

  async paginateSuppliers(query: QuerySupplierDto) {
    const { page, limit, search, isActive } = query;

    return this.paginate({
      page,
      limit,

      where: {
        deletedAt: null,

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  companyName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  phone: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),

        ...(isActive !== undefined
          ? {
              isActive,
            }
          : {}),
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.supplier.findFirst({
      where: {
        phone,
        deletedAt: null,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.supplier.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findActiveById(id: number) {
    return this.prisma.supplier.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async softDelete(id: number) {
    return this.prisma.supplier.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async restore(id: number) {
    return this.prisma.supplier.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
      },
    });
  }
}