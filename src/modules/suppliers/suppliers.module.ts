import { Module } from '@nestjs/common';

import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { SupplierRepository } from './supplier.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [SuppliersController],

  providers: [
    SuppliersService,
    SupplierRepository,
  ],

  exports: [
    SuppliersService,
    SupplierRepository,
  ],
})
export class SuppliersModule {}