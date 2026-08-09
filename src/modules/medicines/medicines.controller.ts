import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';

@Controller('medicines')
export class MedicinesController {
    constructor(
        private readonly medicinesService: MedicinesService,
    ) {}

    @Get()
        findAll(@Query() query: MedicineQueryDto) {
        return this.medicinesService.findAll(query);
        }

    @Get(':id')
        findById(
            @Param('id', ParseIntPipe ) id: number,
        ) {
            return this.medicinesService.findById(id);
        }
    @Post()
    create(@Body() dto: CreateMedicineDto) {
        return this.medicinesService.create(dto);
    }

    @Patch(':id')
        update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateMedicineDto,
        ) {
        return this.medicinesService.update(id, dto);
        }
    @Delete(':id')
        softDelete(@Param('id', ParseIntPipe) id: number) {
        return this.medicinesService.softDelete(id);
        }

    @Patch(':id/restore')
    restore(@Param('id', ParseIntPipe) id: number) {
    return this.medicinesService.restore(id);
}

    @Delete(':id/permanent')
    hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.medicinesService.hardDelete(id);
    }
}
