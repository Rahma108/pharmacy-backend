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

   
  
  ],
  controllers: [AppController ],
  providers: [AppService ],
})
export class AppModule {}
