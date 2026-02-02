import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);

// Configure express
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Register routes
registerRoutes(httpServer, app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve) => {
    app(req as any, res as any, resolve);
  });
}