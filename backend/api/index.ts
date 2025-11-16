import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import express, { Request, Response } from 'express';

const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

let app: any;

async function initializeApp() {
  if (!app) {
    app = await NestFactory.create(AppModule, adapter, {
      logger: ['error', 'warn', 'log'],
    });

    // CORS設定
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  }
  return app;
}

export default async (req: Request, res: Response) => {
  await initializeApp();
  expressApp(req, res);
};
