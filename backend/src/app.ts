/**
 * App Configuration
 * Shared setup for both local development and Vercel serverless
 * 
 * This file initializes the Express app with all middleware and routes.
 * It's imported by both:
 * - src/server.ts (calls app.listen() for local dev)
 * - api/index.ts (exports app for Vercel)
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

// Routes - import directly (no dynamic imports)
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import challengeRoutes from './routes/challenges';
import progressRoutes from './routes/progress';
import journalRoutes from './routes/journal';

dotenv.config();

export function createApp(): Application {
  const app = express();

  // ========================================================================
  // MIDDLEWARE
  // ========================================================================

  app.use(helmet());

  const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      if (!origin) return callback(null, true);
      
      const explicit = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [];
      if (explicit.includes(origin) || explicit.includes('*') || origin?.endsWith('.vercel.app') || 
          origin?.includes('localhost') || origin?.includes('127.0.0.1')) {
        return callback(null, true);
      }
      callback(new Error('CORS blocked'));
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(compression());

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // ========================================================================
  // ROUTES
  // ========================================================================

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'healthy', uptime: process.uptime() });
  });

  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Momentum API', version: '1.0.0' });
  });

  // Mount API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/challenges', challengeRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/journal', journalRoutes);

  // ========================================================================
  // ERROR HANDLERS
  // ========================================================================

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Error', message: 'Route not found', statusCode: 404 });
  });

  app.use((err: any, _req: Request, res: Response, _next: any) => {
    console.error(err);
    res.status(err.statusCode || 500).json({
      error: err.error || 'Error',
      message: err.message || 'Internal server error',
      statusCode: err.statusCode || 500,
    });
  });

  return app;
}
