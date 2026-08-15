import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(data: CreateCategoryDto) {
    const existing =
      await this.categoryRepository.findAll();

    const alreadyExists = existing.some(
      (category) =>
        category.name.toLowerCase() ===
        data.name.toLowerCase(),
    );

    if (alreadyExists) {
      throw new ConflictException(
        'Category already exists',
      );
    }

    const category =
      await this.categoryRepository.create(
        data,
      );

    return {
      message:
        'Category created successfully ✅',
      data: category,
    };
  }

  async findAll() {
    const categories =
      await this.categoryRepository.findAll();

    return {
      message:
        'Categories retrieved successfully ✅',
      data: categories,
    };
  }

  async findById(id: number) {
    const category =
      await this.categoryRepository.findById(
        id,
      );

    if (!category) {
      throw new NotFoundException(
        'Category not found ❕',
      );
    }

    return {
      message:
        'Category retrieved successfully ✅',
      data: category,
    };
  }

  async update(
    id: number,
    data: UpdateCategoryDto,
  ) {
    await this.findById(id);

    if (data.name) {
      const existing =
        await this.categoryRepository.findAll();

      const duplicate = existing.some(
        (category) =>
          category.id !== id &&
          category.name.toLowerCase() ===
            data.name!.toLowerCase(),
      );

      if (duplicate) {
        throw new ConflictException(
          'Category already exists',
        );
      }
    }

    const updatedCategory =
      await this.categoryRepository.update(
        id,
        data,
      );

    return {
      message:
        'Category updated successfully ✅',
      data: updatedCategory,
    };
  }

  async remove(id: number) {
    await this.findById(id);

    const medicinesCount =
      await this.categoryRepository.countMedicines(
        id,
      );

    if (medicinesCount > 0) {
      throw new ConflictException(
        'Cannot delete category because it has medicines ❌',
      );
    }

    const deletedCategory =
      await this.categoryRepository.hardDelete(
        id,
      );

    return {
      message:
        'Category deleted successfully ✅',
      data: deletedCategory,
    };
  }

  async findByIdWithMedicines(
    id: number,
  ) {
    const category =
      await this.categoryRepository.findByIdWithMedicines(
        id,
      );

    if (!category) {
      throw new NotFoundException(
        'Category not found ❌',
      );
    }

    return {
      message:
        'Category and medicines retrieved successfully ✅',
      data: category,
    };
  }
}