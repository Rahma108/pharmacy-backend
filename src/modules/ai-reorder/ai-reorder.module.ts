
import { Module } from '@nestjs/common';
import { AiReorderController } from './ai-reorder.controller';
import { AiReorderService } from './ai-reorder.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AiReorderController],
  providers: [AiReorderService, PrismaService],
})
export class AiReorderModule {}
