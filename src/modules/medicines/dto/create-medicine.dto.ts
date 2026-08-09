import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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

  @IsInt()
  @Min(1)
  categoryId!: number;
}