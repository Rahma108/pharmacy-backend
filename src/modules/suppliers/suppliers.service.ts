import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupplierRepository } from './supplier.repository';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async findAll(query: QuerySupplierDto) {
    const data =
      await this.supplierRepository.paginateSuppliers(query);

    return {
      message: 'Suppliers retrieved successfully',
      data,
    };
  }

  async findById(id: number) {
    const supplier =
      await this.supplierRepository.findById(id);

    if (!supplier) {
      throw new NotFoundException('Supplier not found ❕');
    }

    return {
      message: 'Supplier retrieved successfully',
      data: supplier,
    };
  }

  async create(data: CreateSupplierDto) {
    const existingPhone =
      await this.supplierRepository.findByPhone(data.phone);

    if (existingPhone) {
      throw new BadRequestException(
        'Supplier with this phone already exists ❕',
      );
    }

    if (data.email) {
      const existingEmail =
        await this.supplierRepository.findByEmail(data.email);

      if (existingEmail) {
        throw new BadRequestException(
          'Supplier with this email already exists ❕',
        );
      }
    }

    const supplier =
      await this.supplierRepository.createSupplier(data);

    return {
      message: 'Supplier created successfully',
      data: supplier,
    };
  }

  async update(id: number, data: UpdateSupplierDto) {
    const supplier =
      await this.supplierRepository.findById(id);

    if (!supplier) {
      throw new NotFoundException('Supplier not found ❕');
    }

    if (data.phone && data.phone !== supplier.phone) {
      const existingPhone =
        await this.supplierRepository.findByPhone(data.phone);

      if (existingPhone && existingPhone.id !== id) {
        throw new BadRequestException(
          'Supplier with this phone already exists ❕',
        );
      }
    }

    if (data.email && data.email !== supplier.email) {
      const existingEmail =
        await this.supplierRepository.findByEmail(data.email);

      if (existingEmail && existingEmail.id !== id) {
        throw new BadRequestException(
          'Supplier with this email already exists ❕',
        );
      }
    }

    const updatedSupplier =
      await this.supplierRepository.update(id, data);

    return {
      message: 'Supplier updated successfully',
      data: updatedSupplier,
    };
  }

  async softDelete(id: number) {
    const supplier =
      await this.supplierRepository.findActiveById(id);

    if (!supplier) {
      throw new NotFoundException('Supplier not found ❕');
    }

    const data =
      await this.supplierRepository.softDelete(id);

    return {
      message: 'Supplier deleted successfully',
      data,
    };
  }

  async restore(id: number) {
    const supplier =
      await this.supplierRepository.findById(id);

    if (!supplier) {
      throw new NotFoundException('Supplier not found ❕');
    }

    if (!supplier.deletedAt) {
      throw new BadRequestException(
        'Supplier is already active ✅',
      );
    }

    const data =
      await this.supplierRepository.restore(id);

    return {
      message: 'Supplier restored successfully',
      data,
    };
  }

  async hardDelete(id: number) {
    const supplier =
      await this.supplierRepository.findById(id);

    if (!supplier) {
      throw new NotFoundException('Supplier not found ❕');
    }

    const data =
      await this.supplierRepository.hardDelete(id);

    return {
      message: 'Supplier permanently deleted successfully',
      data,
    };
  }
}