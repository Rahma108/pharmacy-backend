
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateBarcodeDto } from './dto/update-barcode.dto';

@Injectable()
export class BarcodeService {
    constructor(private readonly prisma: PrismaService) {}

    async findMedicineByBarcode(code: string) {
        this.validateBarcode(code);

    const medicine = await this.prisma.medicine.findFirst({
        where: {
            barcode: code,
            deletedAt: null,
        },
        select: {
            id: true,
            name: true,
            barcode: true,
            price: true,
            stock: true,
            category: {
            select: {
                id: true,
                name: true,
            },
            },
        },
        });

        if (!medicine) {
        throw new NotFoundException(
            'Medicine not found for this barcode',
        );
        }

        return {
        message: 'Medicine found successfully',
        data: medicine,
        };
    }

    async updateMedicineBarcode(
        medicineId: number,
        dto: UpdateBarcodeDto,
    ) {
        const medicine = await this.prisma.medicine.findFirst({
        where: {
            id: medicineId,
            deletedAt: null,
        },
        select: {
            id: true,
        },
        });

        if (!medicine) {
        throw new NotFoundException('Active medicine not found');
        }

        const existingBarcode = await this.prisma.medicine.findFirst({
        where: {
            barcode: dto.barcode,
            id: { not: medicineId },
        },
        select: {
            id: true,
        },
        });

        if (existingBarcode) {
        throw new BadRequestException(
            'This barcode is already assigned to another medicine',
        );
        }

        try {
        const updated = await this.prisma.medicine.update({
            where: { id: medicineId },
            data: { barcode: dto.barcode },
            select: {
            id: true,
            name: true,
            barcode: true,
            price: true,
            stock: true,
            category: {
                select: {
                id: true,
                name: true,
                },
            },
            },
        });

        return {
            message: 'Medicine barcode updated successfully',
            data: updated,
        };
        } catch (error) {
        // The database unique constraint also protects against
        // two requests assigning the same barcode concurrently.
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            throw new BadRequestException(
            'This barcode is already assigned to another medicine',
            );
        }

        throw error;
        }
    }

    async deleteMedicineBarcode(medicineId: number) {
        const medicine = await this.prisma.medicine.findFirst({
        where: {
            id: medicineId,
            deletedAt: null,
        },
        select: {
            id: true,
            barcode: true,
        },
        });

        if (!medicine) {
        throw new NotFoundException('Active medicine not found');
        }

        if (!medicine.barcode) {
        throw new BadRequestException(
            'This medicine does not have a barcode',
        );
        }

        const updated = await this.prisma.medicine.update({
        where: { id: medicineId },
        data: { barcode: null },
        select: {
            id: true,
            name: true,
            barcode: true,
        },
        });

        return {
        message: 'Medicine barcode deleted successfully',
        data: updated,
        };
    }

    private validateBarcode(code: string) {
        if (!/^[0-9]{8,14}$/.test(code)) {
        throw new BadRequestException(
            'Barcode must contain 8 to 14 digits',
        );
        }
    }
}
