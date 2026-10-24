import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  ValidateNested,
  IsNumber,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  medicineId!: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity!: number;
}


export class CreateSaleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paidAmount!: number;
}
