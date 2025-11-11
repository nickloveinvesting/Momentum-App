/**
 * Vercel Serverless Handler
 * Exports Express app for Vercel deployment
 * 
 * In Vercel's serverless environment:
 * - We export the app, don't call app.listen()
 * - Vercel handles the HTTP server and request routing
 * - This file is the entry point (api/index.ts)
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Security
app.use(helmet());

// CORS - Allow Vercel deployments and localhost
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);
    
    const allowed = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [];
    if (allowed.includes(origin) || allowed.includes('*') || origin.endsWith('.vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    callback(new Error('CORS blocked'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================================================
// HELPER: Dynamic route loading
// ============================================================================

async function initializeRoutes() {
  try {
    // Dynamically import routes only when needed
    const { default: authRoutes } = await import('../src/routes/auth.js');
    const { default: userRoutes } = await import('../src/routes/users.js');
    const { default: challengeRoutes } = await import('../src/routes/challenges.js');
    const { default: progressRoutes } = await import('../src/routes/progress.js');
    const { default: journalRoutes } = await import('../src/routes/journal.js');

    return { authRoutes, userRoutes, challengeRoutes, progressRoutes, journalRoutes };
  } catch (error) {
    console.error('Route initialization error:', error);
    throw error;
  }
}

let routesInitialized = false;
let routesPromise: Promise<any> | null = null;

// Middleware to ensure routes are loaded before processing requests
app.use(async (req: Request, res: Response, next) => {
  if (!routesInitialized) {
    if (!routesPromise) {
      routesPromise = initializeRoutes();
    }
    
    try {
      const routes = await routesPromise;
      
      // Mount routes
      app.use('/api/auth', routes.authRoutes);
      app.use('/api/users', routes.userRoutes);
      app.use('/api/challenges', routes.challengeRoutes);
      app.use('/api/progress', routes.progressRoutes);
      app.use('/api/journal', routes.journalRoutes);
      
      routesInitialized = true;
    } catch (error) {
      console.error('Failed to initialize routes:', error);
      return res.status(500).json({ error: 'Server initialization error' });
    }
  }
  next();
});

// ============================================================================
// BASIC ROUTES
// ============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Momentum API',
    version: '1.0.0',
  });
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Error',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[ERROR]', err);
  res.status(err.statusCode || 500).json({
    error: err.error || 'Error',
    message: err.message || 'Internal server error',
    statusCode: err.statusCode || 500,
  });
});

// ============================================================================
// EXPORT FOR VERCEL
// ============================================================================

export default app;
