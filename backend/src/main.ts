import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  // Add CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000', // Next.js client
      'http://127.0.0.1:3000' // Alternative localhost notation
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true // Allow requests with cookies
  });

  // OpenAPI/Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('App Template API')
    .setDescription('A modern full-stack application template API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header'
      },
      'JWT-auth'
    )
    .addTag('companies', 'Company management endpoints')
    .addTag('auth', 'Authentication endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha'
    }
  });

  const port = process.env.PORT ?? 3010;
  await app.listen(port);
  console.log(`🚀 NestJS Server is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api-docs`);
}

void bootstrap();
