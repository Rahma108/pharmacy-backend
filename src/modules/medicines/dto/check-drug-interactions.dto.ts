
import {
    ArrayMaxSize,
    ArrayMinSize,
    ArrayUnique,
    IsArray,
    IsInt,
    Min,
    } from 'class-validator';

    export class CheckDrugInteractionsDto {
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(10)
    @ArrayUnique()
    @IsInt({ each: true })
    @Min(1, { each: true })
    medicineIds!: number[];
}
