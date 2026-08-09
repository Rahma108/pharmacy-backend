import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService); 
  app.enableCors();
  // Pipe ..............
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );
    app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  // Interceptors 

  const port = config.get<number>('PORT') ?? 3000; 
  await app.listen(port);
  console.log(`Server is Running on port ${port} 🚀🚀🚀`);

  
}
bootstrap();
