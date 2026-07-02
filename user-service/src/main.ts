import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'userservice',
      protoPath: join(__dirname, '../../proto/user.proto'),
      url: `0.0.0.0:${process.env.GRPC_PORT || 50052}`,
      loader: {
        keepCase: true,
      },
    },
  });

  await app.startAllMicroservices();

  const restPort = process.env.REST_PORT || 3001;
  await app.listen(restPort);

  console.log(`REST API jalan di http://localhost:${restPort}`);
  console.log(`gRPC User Service jalan di port ${process.env.GRPC_PORT || 50052}`);
}
bootstrap();