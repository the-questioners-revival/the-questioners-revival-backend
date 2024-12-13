import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const setTZ = require('set-tz');
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      crossOriginResourcePolicy: false, // Disable Cross-Origin-Resource-Policy
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', 'http://localhost:4001'], // Allow images from localhost:4001
        },
      },
    })
  );

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3001', 'https://the-questioners-revival-frontend.vercel.app', process.env.ORIGIN],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // Allow cookies
  });
  app.use(cookieParser());


  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('The Questioners Revival API')
    .setDescription('Empty')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  setTZ('UTC');

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(4001);
}
bootstrap();
