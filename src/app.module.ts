import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule} from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MedicinesModule } from './modules/medicines/medicines.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './common/common.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { BarcodeModule } from './modules/barcode/barcode.module';
import { BarcodeController } from './modules/barcode/barcode.controller';
import { BarcodeService } from './modules/barcode/barcode.service';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { AiReorderModule } from './modules/ai-reorder/ai-reorder.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath : [".env.development" , ".env.production"],
      isGlobal: true 

    }) ,
    CommonModule,
    PrismaModule,
    MedicinesModule,
    CategoriesModule,
    UsersModule,
    AuthModule,
    SuppliersModule,
    InventoryModule,
    SalesModule,
    BarcodeModule,
    InvoicesModule,
    ReportsModule,
    DashboardModule,
    PrescriptionsModule,
    AiReorderModule ,

   
  
  ],
  controllers: [AppController, BarcodeController ],
  providers: [AppService, BarcodeService ],
})
export class AppModule {}
