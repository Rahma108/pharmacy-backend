
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleEnum } from 'src/common/enum/user.enum';
import { PrismaService } from 'src/prisma/prisma.service';

interface AuthenticatedUser {
  id: number;
  role: RoleEnum;
}

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthenticatedUser) {
    const where = {
      deletedAt: null,
      ...(user.role === RoleEnum.EMPLOYEE
        ? { userId: user.id }
        : {}),
    };

    const sales = await this.prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
            medicine: {
              select: {
                id: true,
                name: true,
                barcode: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Invoices retrieved successfully',
      data: sales.map((sale) => ({
        invoiceNumber: `INV-${sale.id}`,
        saleId: sale.id,
        date: sale.createdAt,
        cashier: sale.user,
        items: sale.items.map((item) => ({
          medicineId: item.medicineId,
          medicineName: item.medicine.name,
          barcode: item.medicine.barcode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        totalAmount: sale.totalAmount,
        paidAmount: sale.paidAmount,
        changeAmount: sale.changeAmount,
      })),
    };
  }

  async findById(id: number, user: AuthenticatedUser) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id,
        deletedAt: null,
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
            medicine: {
              select: {
                id: true,
                name: true,
                barcode: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Invoice not found');
    }

    if (
      user.role === RoleEnum.EMPLOYEE &&
      sale.userId !== user.id
    ) {
      throw new ForbiddenException(
        'You can only access your own invoices',
      );
    }

    return {
      message: 'Invoice retrieved successfully',
      data: {
        invoiceNumber: `INV-${sale.id}`,
        saleId: sale.id,
        date: sale.createdAt,
        updatedAt: sale.updatedAt,
        cashier: sale.user,
        items: sale.items.map((item) => ({
          medicineId: item.medicineId,
          medicineName: item.medicine.name,
          barcode: item.medicine.barcode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        totalAmount: sale.totalAmount,
        paidAmount: sale.paidAmount,
        changeAmount: sale.changeAmount,
      },
    };
  }
}
