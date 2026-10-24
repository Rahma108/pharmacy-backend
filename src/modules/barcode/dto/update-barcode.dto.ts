import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateBarcodeDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[0-9]{8,14}$/, {
        message: 'Barcode must contain 8 to 14 digits',
    })
    barcode!: string;
}