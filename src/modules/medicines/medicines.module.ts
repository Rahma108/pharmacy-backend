import { Module } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { MedicineRepository } from './medicines.repository';
import { CategoryRepository } from '../categories/category.repository';

@Module({
  providers: [MedicinesService ,  MedicineRepository,  CategoryRepository,],
  exports: [MedicinesService , MedicineRepository,],
  controllers: [MedicinesController]
})
export class MedicinesModule {}
