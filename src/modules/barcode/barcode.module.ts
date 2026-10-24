import { Module } from '@nestjs/common';
import { BarcodeController } from './barcode.controller';
import { BarcodeService } from './barcode.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [BarcodeController],
    providers: [BarcodeService],
    exports: [BarcodeService],
})
export class BarcodeModule {}