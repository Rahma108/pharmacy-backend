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
        const data = await this.medicineRepository.paginateMedicines(query);
        return {
        message: 'Medicines retrieved successfully',
        data,
        };
    }
    async findAllWithCategory() {
        const data = await this.medicineRepository.findAllWithCategory();
        return {
        message: 'Medicines with categories retrieved successfully',
        data,
        };
    }

    async findById(id: number) {
        const medicine = await this.medicineRepository.findById(id);

        if (!medicine) {
        throw new NotFoundException('Medicine not found ❕');
        }

        return {
        message: 'Medicine retrieved successfully',
        data: medicine,
        };
    }

    async create(data: CreateMedicineDto) {
        const medicine =
        await this.medicineRepository.createMedicine(data);

        return {
        message: 'Medicine created successfully',
        data: medicine,
        };
    }

    async update(id: number, data: UpdateMedicineDto) {
        const medicine = await this.medicineRepository.findById(id);

        if (!medicine) {
        throw new NotFoundException('Medicine not found ❕');
        }

        const updatedMedicine =
        await this.medicineRepository.update(id, data);

        return {
        message: 'Medicine updated successfully',
        data: updatedMedicine,
        };
    }

    async softDelete(id: number) {
        const medicine =
        await this.medicineRepository.findActiveById(id);

        if (!medicine) {
        throw new NotFoundException('Medicine not found ❕');
        }

        const data = await this.medicineRepository.softDelete(id);

        return {
        message: 'Medicine deleted successfully',
        data,
        };
    }

    async restore(id: number) {
        const medicine =
        await this.medicineRepository.findById(id);

        if (!medicine) {
        throw new NotFoundException('Medicine not found ❕');
        }

        if (!medicine.deletedAt) {
        throw new BadRequestException(
            'Medicine is already active ✅',
        );
        }

        const data = await this.medicineRepository.restore(id);

        return {
        message: 'Medicine restored successfully',
        data,
        };
    }

    async hardDelete(id: number) {
        const medicine =
        await this.medicineRepository.findById(id);

        if (!medicine) {
        throw new NotFoundException('Medicine not found ❕');
        }

        const data =
        await this.medicineRepository.hardDelete(id);

        return {
        message: 'Medicine permanently deleted successfully',
        data,
        };
    }
    }