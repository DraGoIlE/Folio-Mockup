import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const restPort = process.env.REST_PORT || 3000;
  await app.listen(restPort);

  console.log(`Login Service jalan di http://localhost:${restPort}`);
}
bootstrap();