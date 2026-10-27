
import { Controller, Get } from '@nestjs/common';
import { AiReorderService } from './ai-reorder.service';

@Controller('ai-reorder')
export class AiReorderController {
    constructor(
        private readonly aiReorderService: AiReorderService,
    ) {}

    @Get('suggestions')
    getSuggestions() {
        return this.aiReorderService.getSuggestions();
    }
}
