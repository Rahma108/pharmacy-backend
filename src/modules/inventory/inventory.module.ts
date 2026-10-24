import { Module } from '@nestjs/common';

import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from './inventory.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
    AuthModule,
  ],

  controllers: [InventoryController],

  providers: [
    InventoryService,
    InventoryRepository,
  ],

  exports: [
    InventoryService,
    InventoryRepository,
  ],
})
export class InventoryModule {}