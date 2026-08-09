import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateMedicineDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsNumber()
    @Min(0)
    price!: number;

    @IsInt()
    @Min(0)
    stock!: number;
}