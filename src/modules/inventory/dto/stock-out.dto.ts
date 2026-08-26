import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class StockOutDto {
  @IsInt()
  @IsPositive()
  medicineId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}