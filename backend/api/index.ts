/**
 * Vercel Serverless Handler
 * 
 * This file handles the Express app for Vercel's serverless environment.
 * The app is initialized here and exported without calling app.listen().
 * 
 * For local development, use src/server.ts which calls app.listen(3001)
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(helmet());

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);
    
    const explicit = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [];
    if (explicit.includes(origin) || explicit.includes('*') || origin.endsWith('.vercel.app') || 
        origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    callback(new Error('CORS'));
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

// ============================================================================
// BASIC ENDPOINTS
// ============================================================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Momentum API', version: '1.0.0' });
});

// ============================================================================
// ROUTE LOADER
// ============================================================================

let routesLoaded = false;

app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (routesLoaded) {
    return next();
  }

  try {
    // Import routes
    const authModule = await import('../dist/routes/auth.js');
    const userModule = await import('../dist/routes/users.js');
    const challengeModule = await import('../dist/routes/challenges.js');
    const progressModule = await import('../dist/routes/progress.js');
    const journalModule = await import('../dist/routes/journal.js');

    // Get default exports
    const authRoutes = authModule.default;
    const userRoutes = userModule.default;
    const challengeRoutes = challengeModule.default;
    const progressRoutes = progressModule.default;
    const journalRoutes = journalModule.default;

    // Mount routes directly on app
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/challenges', challengeRoutes);
    app.use('/api/progress', progressRoutes);
    app.use('/api/journal', journalRoutes);

    console.log('Routes loaded');
    routesLoaded = true;
    next();
  } catch (error) {
    console.error('Route loading failed:', error);
    res.status(500).json({ error: 'Server error', message: String(error) });
  }
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', statusCode: 404 });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Error', message: err.message, statusCode: 500 });
});

export default app;
