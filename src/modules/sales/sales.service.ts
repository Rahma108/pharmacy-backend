
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { SalesRepository } from './sales.repository';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleQueryDto } from './dto/sale-query.dto';
import { RoleEnum } from 'src/common/enum';
import { UpdateSaleDto } from './dto/update-sale.dto';


// Add this interface outside the class.
interface AuthenticatedUser {
  id: number;
  role: RoleEnum;
}

@Injectable()
export class SalesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly salesRepository: SalesRepository,
    ) {}

    async findAll(
                query: SaleQueryDto,
                user: AuthenticatedUser,
                ) {
                const effectiveQuery: SaleQueryDto =
                    user.role === RoleEnum.EMPLOYEE
                    ? { ...query, userId: user.id }
                    : query;

                const data =
                    await this.salesRepository.paginateSales(effectiveQuery);

                        return {
                            message: 'Sales retrieved successfully',
                            data,
                        };
                }

    async findById(
        id: number,
        user: AuthenticatedUser,
        ) {
        const sale =
            await this.salesRepository.findSaleById(id);

        if (!sale) {
            throw new NotFoundException('Sale not found');
        }

        if (
            user.role === RoleEnum.EMPLOYEE &&
            sale.userId !== user.id
        ) {
            throw new ForbiddenException(
            'You can only access your own sales',
            );
        }

        return {
            message: 'Sale retrieved successfully',
            data: sale,
        };
        }

    async create(userId: number, dto: CreateSaleDto) {
        if (!Number.isInteger(userId) || userId <= 0) {
        throw new BadRequestException('Invalid authenticated user');
        }

        if (!dto.items?.length) {
        throw new BadRequestException(
            'At least one medicine is required',
        );
        }

        // Prevent duplicate medicine entries in the same sale.
        const medicineIds = dto.items.map((item) => item.medicineId);

        if (new Set(medicineIds).size !== medicineIds.length) {
        throw new BadRequestException(
            'Each medicine must appear only once in a sale',
        );
        }

        const paidCents = Math.round(dto.paidAmount * 100);

        if (!Number.isSafeInteger(paidCents) || paidCents < 0) {
        throw new BadRequestException('Invalid paid amount');
        }

        const sale = await this.prisma.$transaction(async (tx) => {
        const preparedItems: {
            medicineId: number;
            quantity: number;
            unitPriceCents: number;
            totalPriceCents: number;
        }[] = [];

        let totalCents = 0;

        for (const item of dto.items) {
            const medicine = await tx.medicine.findFirst({
            where: {
                id: item.medicineId,
                deletedAt: null,
            },
            });

            if (!medicine) {
            throw new NotFoundException(
                `Medicine ${item.medicineId} not found`,
            );
            }

            if (
            !Number.isInteger(item.quantity) ||
            item.quantity <= 0
            ) {
            throw new BadRequestException(
                'Quantity must be a positive integer',
            );
            }

            // Convert the database price to integer cents
            // to avoid floating-point money calculations.
            const unitPriceCents = Math.round(
            Number(medicine.price) * 100,
            );

            const totalPriceCents =
            unitPriceCents * item.quantity;

            if (
            !Number.isSafeInteger(unitPriceCents) ||
            !Number.isSafeInteger(totalPriceCents)
            ) {
            throw new BadRequestException(
                'Invalid medicine price or total',
            );
            }

            totalCents += totalPriceCents;

            if (!Number.isSafeInteger(totalCents)) {
            throw new BadRequestException('Sale total is too large');
            }

            // Atomic stock check and deduction.
            // If another sale has already used the stock,
            // this update affects zero rows.
            const stockUpdate = await tx.medicine.updateMany({
            where: {
                id: medicine.id,
                deletedAt: null,
                stock: { gte: item.quantity },
            },
            data: {
                stock: { decrement: item.quantity },
            },
            });

            if (stockUpdate.count !== 1) {
            throw new BadRequestException(
                `Insufficient stock for ${medicine.name}`,
            );
            }

            preparedItems.push({
            medicineId: medicine.id,
            quantity: item.quantity,
            unitPriceCents,
            totalPriceCents,
            });
        }

        if (paidCents < totalCents) {
            throw new BadRequestException(
            'Paid amount cannot be less than the sale total',
            );
        }

        const createdSale = await tx.sale.create({
            data: {
            user: {
                connect: { id: userId },
            },
            totalAmount: (totalCents / 100).toFixed(2),
            paidAmount: (paidCents / 100).toFixed(2),
            changeAmount: ((paidCents - totalCents) / 100).toFixed(2),

            items: {
                create: preparedItems.map((item) => ({
                medicine: {
                    connect: { id: item.medicineId },
                },
                quantity: item.quantity,
                unitPrice: (item.unitPriceCents / 100).toFixed(2),
                totalPrice: (item.totalPriceCents / 100).toFixed(2),
                })),
            },
            },
            include: {
            items: {
                include: { medicine: true },
            },
            },
        });

        // Record every stock deduction in the inventory history.
        for (const item of preparedItems) {
            await tx.inventoryTransaction.create({
            data: {
                medicine: {
                connect: { id: item.medicineId },
                },
                type: 'STOCK_OUT',
                quantity: item.quantity,
                reason: `Sale #${createdSale.id}`,
            },
            });
        }

        return createdSale;
        });

        return {
        message: 'Sale created successfully',
        data: sale,
        };
    }

    async update(id: number, dto: UpdateSaleDto) {
  const sale = await this.prisma.sale.findFirst({
    where: { id, deletedAt: null },
    });

    if (!sale) {
        throw new NotFoundException('Active sale not found');
    }

    if (dto.paidAmount === undefined) {
        throw new BadRequestException(
        'paidAmount is required',
        );
    }

    const paidCents = Math.round(dto.paidAmount * 100);
    const totalCents = Math.round(
        Number(sale.totalAmount) * 100,
    );

    if (
        !Number.isSafeInteger(paidCents) ||
        paidCents < totalCents
    ) {
        throw new BadRequestException(
        'Paid amount cannot be less than the sale total',
        );
    }

    const updated = await this.prisma.sale.update({
        where: { id },
        data: {
        paidAmount: (paidCents / 100).toFixed(2),
        changeAmount: (
            (paidCents - totalCents) / 100
        ).toFixed(2),
        },
    });

    return {
        message: 'Sale updated successfully',
        data: updated,
    };
    }

    async softDelete(id: number) {
    return this.prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findFirst({
        where: { id, deletedAt: null },
        include: { items: true },
        });

        if (!sale) {
        throw new NotFoundException('Active sale not found');
        }

        // Restore the quantities sold back to stock.
        for (const item of sale.items) {
        await tx.medicine.update({
            where: { id: item.medicineId },
            data: {
            stock: { increment: item.quantity },
            },
        });

        await tx.inventoryTransaction.create({
            data: {
            medicine: {
                connect: { id: item.medicineId },
            },
            type: 'STOCK_IN',
            quantity: item.quantity,
            reason: `Void sale #${sale.id}`,
            },
        });
        }

        const deleted = await tx.sale.update({
        where: { id },
        data: { deletedAt: new Date() },
        });

        return {
        message: 'Sale soft-deleted successfully',
        data: deleted,
        };
    });
    }

    async restore(id: number) {
    return this.prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findFirst({
        where: {
            id,
            deletedAt: { not: null },
        },
        include: { items: true },
        });

        if (!sale) {
        throw new NotFoundException(
            'Deleted sale not found',
        );
        }

        // Re-deduct stock only if enough stock is available.
        for (const item of sale.items) {
        const result = await tx.medicine.updateMany({
            where: {
            id: item.medicineId,
            deletedAt: null,
            stock: { gte: item.quantity },
            },
            data: {
            stock: { decrement: item.quantity },
            },
        });

        if (result.count !== 1) {
            throw new BadRequestException(
            `Insufficient stock to restore sale #${id}`,
            );
        }

        await tx.inventoryTransaction.create({
            data: {
            medicine: {
                connect: { id: item.medicineId },
            },
            type: 'STOCK_OUT',
            quantity: item.quantity,
            reason: `Restore sale #${sale.id}`,
            },
        });
        }

        const restored = await tx.sale.update({
        where: { id },
        data: { deletedAt: null },
        });

        return {
        message: 'Sale restored successfully',
        data: restored,
        };
    });
    }

    async hardDelete(id: number) {
    return this.prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findFirst({
        where: {
            id,
            deletedAt: { not: null },
        },
        });

        if (!sale) {
        throw new NotFoundException(
            'Soft-deleted sale not found',
        );
        }

        // Delete child records first to avoid foreign-key errors.
        await tx.saleItem.deleteMany({
        where: { saleId: id },
        });

        await tx.sale.delete({
        where: { id },
        });

        return {
        message: 'Sale permanently deleted',
        };
    });
}
}
