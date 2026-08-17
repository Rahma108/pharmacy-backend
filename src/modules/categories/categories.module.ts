import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryRepository } from './category.repository';
import { AuthModule } from '../auth/auth.module';

@Module({

  imports: [AuthModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CategoryRepository,
  ],
})
export class CategoriesModule {}