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
        const existing = await this.categoryRepository.findAll();

        const alreadyExists = existing.some(
            (category) =>
            category.name.toLowerCase() === data.name.toLowerCase(),
        );

        if (alreadyExists) {
            throw new ConflictException('Category already exists');
        }

        return this.categoryRepository.create(data);
}

    async findAll() {
        return this.categoryRepository.findAll();
    }

    async findById(id: number) {
        const category = await this.categoryRepository.findById(id);

        if (!category) {
        throw new NotFoundException('Category not found ❕');
        }

        return category;
    }

    async update(id: number, data: UpdateCategoryDto) {
        await this.findById(id);

        if (data.name) {
            const existing = await this.categoryRepository.findAll();

            const duplicate = existing.some(
            (category) =>
                category.id !== id &&
                category.name.toLowerCase() === data.name!.toLowerCase(),
            );

            if (duplicate) {
            throw new ConflictException('Category already exists');
            }
        }

        return this.categoryRepository.update(id, data);
}

    async remove(id: number) {
        await this.findById(id);

        const medicinesCount =
            await this.categoryRepository.countMedicines(id);

        if (medicinesCount > 0) {
            throw new ConflictException(
            'Cannot delete category because it has medicines ❌',
            );
        }

        return this.categoryRepository.hardDelete(id);
}

    async findByIdWithMedicines(id: number) {
    const category =
        await this.categoryRepository.findByIdWithMedicines(id);

    if (!category) {
        throw new NotFoundException('Category not found ❌');
    }

    return category;
}
}