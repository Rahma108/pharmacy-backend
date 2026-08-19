import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

import { Auth } from 'src/common/decorator';
import { RoleEnum } from 'src/common/enum';
import { QuerySupplierDto } from './dto/query-supplier.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(
    private readonly suppliersService: SuppliersService,
  ) {}

  @Get()
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
    RoleEnum.EMPLOYEE,
  ])
  findAll(
    @Query() query: QuerySupplierDto,
  ) {
    return this.suppliersService.findAll(
      query,
    );
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
    return this.suppliersService.findById(
      id,
    );
  }

  @Post()
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
  ])
  create(
    @Body() dto: CreateSupplierDto,
  ) {
    return this.suppliersService.create(
      dto,
    );
  }

  @Patch(':id')
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
  ])
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  @Auth([RoleEnum.ADMIN])
  softDelete(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.suppliersService.softDelete(
      id,
    );
  }

  @Patch(':id/restore')
  @Auth([RoleEnum.ADMIN])
  restore(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.suppliersService.restore(
      id,
    );
  }

  @Delete(':id/permanent')
  @Auth([RoleEnum.ADMIN])
  hardDelete(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.suppliersService.hardDelete(
      id,
    );
  }
}