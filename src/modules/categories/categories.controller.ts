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

import { Auth } from 'src/common/decorator';
import { RoleEnum } from 'src/common/enum';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Post()
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
  ])
  create(
    @Body() data: CreateCategoryDto,
  ) {
    return this.categoriesService.create(data);
  }

  @Get()
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
    RoleEnum.EMPLOYEE,
  ])
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
    RoleEnum.EMPLOYEE,
  ])
  findById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriesService.findById(id);
  }

  @Patch(':id')
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
  ])
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(
      id,
      data,
    );
  }

  @Delete(':id')
  @Auth([RoleEnum.ADMIN])
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriesService.remove(id);
  }

  @Patch(':id/restore')
  @Auth([RoleEnum.ADMIN])
  restore(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriesService.restore(id);
  }

  @Delete(':id/permanent')
  @Auth([RoleEnum.ADMIN])
  permanentDelete(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriesService.permanentDelete(
      id,
    );
  }

  @Get(':id/medicines')
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
    RoleEnum.EMPLOYEE,
  ])
  findByIdWithMedicines(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriesService.findByIdWithMedicines(
      id,
    );
  }
}