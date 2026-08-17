import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { MedicineRepository } from './medicines.repository';

import { CategoryRepository } from '../categories/category.repository';

@Module({
  imports: [
    forwardRef(() => AuthModule),
  ],

  providers: [
    MedicinesService,
    MedicineRepository,
    CategoryRepository,
  ],

  exports: [
    MedicinesService,
    MedicineRepository,
  ],

  controllers: [
    MedicinesController,
  ],
})
export class MedicinesModule {}