import { Module } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { MedicineRepository } from './medicines.repository';

@Module({
  providers: [MedicinesService ,  MedicineRepository,],
  exports: [MedicinesService , MedicineRepository,],
  controllers: [MedicinesController]
})
export class MedicinesModule {}
