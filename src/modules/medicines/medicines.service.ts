import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MedicineRepository } from './medicines.repository';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { CategoryRepository } from '../categories/category.repository';

@Injectable()
    export class MedicinesService {
    constructor(
        private readonly medicineRepository: MedicineRepository,
          private readonly categoryRepository: CategoryRepository,
    ) {}
     async findAll(query: MedicineQueryDto) {
        return this.medicineRepository.paginateMedicines(query);
        }
    async findAllWithCategory() {
        return this.medicineRepository.findAllWithCategory();
}

    async findById(id: number) {
        const medicine = await this.medicineRepository.findById(id);
        if (!medicine) {
            throw new NotFoundException('Medicine not found ❕');
        }
        return medicine;
    }



    async softDelete(id: number) {
        const medicine =
            await this.medicineRepository.findActiveById(id);

        if (!medicine) {
            throw new NotFoundException('Medicine not found ❕');
        }

        return this.medicineRepository.softDelete(id);
        }

    async restore(id: number) {
    const medicine =
        await this.medicineRepository.findById(id);

    if (!medicine) {
        throw new NotFoundException('Medicine not found ❕' );
    }

    if (!medicine.deletedAt) {
        throw new BadRequestException(
        'Medicine is already active ✅',
        );
    }

    return this.medicineRepository.restore(id);
}
    async create(data: CreateMedicineDto) {
    return this.medicineRepository.createMedicine(data);
    }

    async update(id: number, data: UpdateMedicineDto) {
        const medicine = await this.medicineRepository.findById(id);
        if (!medicine) {
            throw new NotFoundException('Medicine not found');
        }
            return this.medicineRepository.update(id, data);
}
    async hardDelete(id: number) {
        const medicine =
            await this.medicineRepository.findById(id);

        if (!medicine) {
            throw new NotFoundException('Medicine not found ❕');
        }

        return this.medicineRepository.hardDelete(id);
}
}