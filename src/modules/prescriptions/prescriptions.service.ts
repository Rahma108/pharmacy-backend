
import {
    BadGatewayException,
    Injectable,
    InternalServerErrorException,
    } from '@nestjs/common';
    import { ConfigService } from '@nestjs/config';

    @Injectable()
export class PrescriptionsService {
        constructor(private readonly configService: ConfigService) {}

        async extractText(file: Express.Multer.File) {
            const apiKey = this.configService.get<string>(
            'OCR_SPACE_API_KEY',
            );

            if (!apiKey) {
            throw new InternalServerErrorException(
                'OCR API key is not configured',
            );
            }

            try {
            const formData = new FormData();

            const image = new Blob([new Uint8Array(file.buffer)], {
                type: file.mimetype,
            });

            formData.append('file', image, file.originalname);
            formData.append('language', 'auto');
            formData.append('OCREngine', '3');

            const response = await fetch(
                'https://api.ocr.space/parse/image',
                {
                method: 'POST',
                headers: {
                    apikey: apiKey,
                },
                body: formData,
                },
            );

            if (!response.ok) {
                throw new Error(`OCR API returned ${response.status}`);
            }

            const result = await response.json();

            if (result.IsErroredOnProcessing) {
                throw new Error(
                'OCR processing failed',
                );
            }

            const parsedText = (result.ParsedResults ?? [])
                .map((item: { ParsedText?: string }) => item.ParsedText ?? '')
                .join('\n')
                .trim();

            return {
                success: true,
                parsedText,
                requiresPharmacistReview: true,
                message: parsedText
                ? 'Review the extracted text before using it.'
                : 'No readable text was detected. Please review the image.',
            };
            } catch {
            throw new BadGatewayException(
                'Unable to process the image with OCR service',
            );
            }
        }
}
