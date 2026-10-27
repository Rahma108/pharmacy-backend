
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsRepository {
  constructor(
        private readonly prisma: PrismaService,
    ) {}

    // 1. Inventory Status Report
    async getInventoryStatus(threshold: number) {
        const activeMedicineFilter = {
        deletedAt: null,
        };

        const [
        lowStockMedicines,
        outOfStockMedicines,
        totalMedicines,
        ] = await Promise.all([
        this.prisma.medicine.findMany({
            where: {
            ...activeMedicineFilter,
            stock: {
                gt: 0,
                lte: threshold,
            },
            },
            orderBy: { stock: 'asc' },
            include: { category: true },
        }),

        this.prisma.medicine.findMany({
            where: {
            ...activeMedicineFilter,
            stock: 0,
            },
            orderBy: { name: 'asc' },
            include: { category: true },
        }),

        this.prisma.medicine.count({
            where: activeMedicineFilter,
        }),
        ]);

        return {
        totalMedicines,
        lowStockMedicines,
        outOfStockMedicines,
        };
    }

    // 2. Get Sales for Summary and Sales Over Time
    async findSales(where: Prisma.SaleWhereInput) {
        return this.prisma.sale.findMany({
        where,
        select: {
            id: true,
            totalAmount: true,
            createdAt: true,
            items: {
            select: {
                quantity: true,
            },
            },
        },
        orderBy: {
            createdAt: 'asc',
        },
        });
    }

    // 3. Get Sale Items for Top Medicines Report
    async findSaleItems(
        where: Prisma.SaleItemWhereInput,
    ) {
        return this.prisma.saleItem.findMany({
        where,
        select: {
            quantity: true,
            medicineId: true,
            medicine: {
            select: {
                id: true,
                name: true,
            },
            },
        },
        });
    }
}
