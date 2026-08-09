import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService,
    ) {}

    @Post()
    create(@Body() data: CreateCategoryDto) {
    return this.categoriesService.create(data);
}



    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    findById(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.categoriesService.findById(id);
    }

    @Patch(':id')
    update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCategoryDto,
    ) {
    return this.categoriesService.update(id, data);
}

    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.categoriesService.remove(id);
    }


    @Get(':id/medicines')
        findByIdWithMedicines(
        @Param('id', ParseIntPipe) id: number,
        ) {
        return this.categoriesService.findByIdWithMedicines(id);
        }
}