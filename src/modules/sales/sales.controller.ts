
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';

import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleQueryDto } from './dto/sale-query.dto';

import { Auth, User } from 'src/common/decorator';
import { RoleEnum } from 'src/common/enum';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
  ) {}

  @Get()
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
    RoleEnum.EMPLOYEE,
  ])
  findAll(
    @Query() query: SaleQueryDto,
    @User() user: { id: number; role: RoleEnum },
  ) {
    return this.salesService.findAll(query, user);
  }

  @Get(':id')
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
    RoleEnum.EMPLOYEE,
  ])
  findById(
    @Param('id', ParseIntPipe) id: number,
    @User() user: { id: number; role: RoleEnum },
  ) {
    return this.salesService.findById(id, user);
  }

  @Post()
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
    RoleEnum.EMPLOYEE,
  ])
  create(
    @Body() dto: CreateSaleDto,
    @User() user: { id: number; role: RoleEnum },
  ) {
    return this.salesService.create(user.id, dto);
  }

  @Patch(':id')
    @Auth([
      RoleEnum.ADMIN,
      RoleEnum.PHARMACIST,
    ])
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateSaleDto,
    ) {
      return this.salesService.update(id, dto);
    }

  @Delete(':id')
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
  ])
  softDelete(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.salesService.softDelete(id);
  }

  @Patch(':id/restore')
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
  ])
  restore(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.salesService.restore(id);
  }

  @Delete(':id/hard')
  @Auth([RoleEnum.ADMIN])
  hardDelete(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.salesService.hardDelete(id);
  }
}

