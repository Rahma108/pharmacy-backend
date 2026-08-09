import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule} from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MedicinesModule } from './modules/medicines/medicines.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath : [".env.development" , ".env.production"],
      isGlobal: true 

    }) ,

    PrismaModule,
    MedicinesModule,
   
  
  ],
  controllers: [AppController ],
  providers: [AppService ],
})
export class AppModule {}
