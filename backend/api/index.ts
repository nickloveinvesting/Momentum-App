/**
 * Vercel Serverless Handler
 * Complete self-contained Express app for Vercel deployment
 */

import express, { Application, Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(helmet());

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    if (!origin) return callback(null, true);
    const explicit = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [];
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

// ============================================================================
// BASIC ROUTES
// ============================================================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Momentum API', version: '1.0.0' });
});

// ============================================================================
// STUB AUTH ROUTES (Replace with real routes once loaded)
// ============================================================================

// This middleware attempts to load real routes on first request
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // If routes are already loaded, skip
  if ((app as any).routesLoaded) return next();

  try {
    // Try to load real routes from src
    let authRoutes, userRoutes, challengeRoutes, progressRoutes, journalRoutes;
    
    try {
      // Try loading from src first
      ({ default: authRoutes } = await import('./src/routes/auth.js'));
      ({ default: userRoutes } = await import('./src/routes/users.js'));
      ({ default: challengeRoutes } = await import('./src/routes/challenges.js'));
      ({ default: progressRoutes } = await import('./src/routes/progress.js'));
      ({ default: journalRoutes } = await import('./src/routes/journal.js'));
    } catch (e1) {
      try {
        // Try loading from dist
        ({ default: authRoutes } = await import('./dist/routes/auth.js'));
        ({ default: userRoutes } = await import('./dist/routes/users.js'));
        ({ default: challengeRoutes } = await import('./dist/routes/challenges.js'));
        ({ default: progressRoutes } = await import('./dist/routes/progress.js'));
        ({ default: journalRoutes } = await import('./dist/routes/journal.js'));
      } catch (e2) {
        console.log('⚠️  Could not load routes, using stub handlers');
        // Create stub routes if imports fail
        authRoutes = Router();
        userRoutes = Router();
        challengeRoutes = Router();
        progressRoutes = Router();
        journalRoutes = Router();

        // Stub handler for testing
        authRoutes.post('/register', (req: Request, res: Response) => {
          res.status(500).json({ error: 'Routes not initialized', message: 'Auth module failed to load' });
        });
      }
    }

    // Mount real routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/challenges', challengeRoutes);
    app.use('/api/progress', progressRoutes);
    app.use('/api/journal', journalRoutes);

    (app as any).routesLoaded = true;
    console.log('✅ Routes loaded');
    next();
  } catch (error) {
    console.error('Route initialization error:', error);
    res.status(500).json({ error: 'Server error', message: String(error) });
  }
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

app.use((_req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Error',
    message: 'Route not found',
    statusCode: 404
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(err.statusCode || 500).json({
    error: err.error || 'Error',
    message: err.message || 'Internal server error',
    statusCode: err.statusCode || 500,
  });
});

export default app;
