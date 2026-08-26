import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class StockAdjustmentDto {
  @IsInt()
  @IsNotEmpty()
  medicineId!: number;

  @IsInt()
  @IsNotEmpty()
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}