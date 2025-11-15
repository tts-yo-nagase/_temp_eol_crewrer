import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';

// Cache the NestJS app instance to avoid recreating it on every request
let cachedApp: NestExpressApplication | null = null;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn'], // Reduce logging for serverless
  });

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Add CORS configuration - include Vercel domains
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  // Add Vercel preview and production URLs if available
  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.NEXT_PUBLIC_VERCEL_URL}`);
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Note: Swagger is disabled in serverless mode for faster cold starts
  // If you need API docs, use the Container Apps deployment

  await app.init();
  cachedApp = app;

  return app;
}

// Export the handler for Vercel
export default async (req: any, res: any) => {
  const app = await createApp();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
};
