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

import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';

import { Auth } from 'src/common/decorator';
import { RoleEnum } from 'src/common/enum';

@Controller('medicines')
export class MedicinesController {
  constructor(
    private readonly medicinesService: MedicinesService,
  ) {}

    @Get()
    @Auth([
        RoleEnum.ADMIN,
        RoleEnum.PHARMACIST,
        RoleEnum.EMPLOYEE,
    ])
    findAll(
        @Query() query: MedicineQueryDto,
    ) {
        return this.medicinesService.findAll(
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
        return this.medicinesService.findById(
        id,
        );
    }

    @Post()
    @Auth([
        RoleEnum.ADMIN,
        RoleEnum.PHARMACIST,
    ])
    create(
        @Body() dto: CreateMedicineDto,
    ) {
        return this.medicinesService.create(
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
        @Body() dto: UpdateMedicineDto,
    ) {
        return this.medicinesService.update(
        id,
        dto,
        );
    }

    @Delete(':id')
    @Auth([RoleEnum.ADMIN])
    softDelete(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.medicinesService.softDelete(
        id,
        );
    }

    @Patch(':id/restore')
    @Auth([RoleEnum.ADMIN])
    restore(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.medicinesService.restore(
        id,
        );
    }

    @Delete(':id/permanent')
    @Auth([RoleEnum.ADMIN])
    hardDelete(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.medicinesService.hardDelete(
        id,
        );
    }
}