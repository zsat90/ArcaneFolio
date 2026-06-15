import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

let cachedServer: express.Express | null = null;

async function createServer() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });

  await app.init();
  return expressApp;
}

export default async function handler(
  req: express.Request,
  res: express.Response,
) {
  if (!cachedServer) {
    cachedServer = await createServer();
  }

  return cachedServer(req, res);
}
