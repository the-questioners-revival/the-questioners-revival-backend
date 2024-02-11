import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const setTZ = require('set-tz');
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Enable CORS if needed
  app.enableCors();

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('The Questioners Revival API')
    .setDescription('Empty')
    .setVersion('1.0')
    .build();

  setTZ('UTC');

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(4000);
}
bootstrap();
