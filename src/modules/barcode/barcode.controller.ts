import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Body,
} from '@nestjs/common';

import { BarcodeService } from './barcode.service';
import { UpdateBarcodeDto } from './dto/update-barcode.dto';
import { Auth } from 'src/common/decorator';
import { RoleEnum } from 'src/common/enum';

@Controller()
export class BarcodeController {
    constructor(
        private readonly barcodeService: BarcodeService,
    ) {}

    @Get('barcode/:code')
    @Auth([
        RoleEnum.ADMIN,
        RoleEnum.PHARMACIST,
        RoleEnum.EMPLOYEE,
    ])
    findMedicineByBarcode(@Param('code') code: string) {
        return this.barcodeService.findMedicineByBarcode(code);
    }

    @Patch('medicines/:id/barcode')
    @Auth([RoleEnum.ADMIN, RoleEnum.PHARMACIST])
    updateBarcode(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBarcodeDto,
    ) {
        return this.barcodeService.updateMedicineBarcode(id, dto);
    }

    @Delete('medicines/:id/barcode')
    @Auth([RoleEnum.ADMIN, RoleEnum.PHARMACIST])
    deleteBarcode(@Param('id', ParseIntPipe) id: number) {
        return this.barcodeService.deleteMedicineBarcode(id);
    }
}