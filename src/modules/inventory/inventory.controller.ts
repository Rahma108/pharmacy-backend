import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { InventoryService } from './inventory.service';

import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';

import { Auth } from 'src/common/decorator';
import { RoleEnum } from 'src/common/enum';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}



  
    @Get('low-stock/prediction')
    @Auth([
      RoleEnum.ADMIN,
      RoleEnum.PHARMACIST,
    ])
    predictLowStock() {
      return this.inventoryService.predictLowStock();
    }

  @Get()
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
    RoleEnum.EMPLOYEE,
  ])
  findAll(
    @Query() query: InventoryQueryDto,
  ) {
    return this.inventoryService.findAll(query);
  }

  @Post('stock-in')
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
  ])
  stockIn(
    @Body() dto: StockInDto,
  ) {
    return this.inventoryService.stockIn(dto);
  }

  @Post('stock-out')
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
  ])
  stockOut(
    @Body() dto: StockOutDto,
  ) {
    return this.inventoryService.stockOut(dto);
  }

  @Post('adjust')
  @Auth([RoleEnum.ADMIN])
  adjust(
    @Body() dto: StockAdjustmentDto,
  ) {
    return this.inventoryService.adjust(dto);
  }
}