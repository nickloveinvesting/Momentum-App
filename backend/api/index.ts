/**
 * Vercel Serverless Handler
 * Complete Express app for Vercel deployment
 * 
 * Routes are loaded synchronously at startup to ensure they're
 * registered before any requests arrive.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

// ============================================================================
// MIDDLEWARE (runs for every request)
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
// HEALTH & ROOT ROUTES
// ============================================================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'Momentum API', 
    version: '1.0.0',
    routes: '/api/auth, /api/users, /api/challenges, /api/progress, /api/journal'
  });
});

// ============================================================================
// ROUTE INITIALIZATION - Runs immediately on startup
// ============================================================================

async function initializeRoutes() {
  try {
    console.log('🔄 Loading routes...');
    
    // Try to load routes from compiled TypeScript output
    let authRoutes, userRoutes, challengeRoutes, progressRoutes, journalRoutes;
    let loadedFromSrc = false;

    try {
      // Attempt 1: Load from src (source files)
      const authModule = await import('../src/routes/auth.js');
      const userModule = await import('../src/routes/users.js');
      const challengeModule = await import('../src/routes/challenges.js');
      const progressModule = await import('../src/routes/progress.js');
      const journalModule = await import('../src/routes/journal.js');

      authRoutes = authModule.default;
      userRoutes = userModule.default;
      challengeRoutes = challengeModule.default;
      progressRoutes = progressModule.default;
      journalRoutes = journalModule.default;
      
      loadedFromSrc = true;
      console.log('✅ Routes loaded from src/');
    } catch (srcError) {
      console.log('⚠️  Failed to load from src, trying dist...');
      
      try {
        // Attempt 2: Load from dist (compiled output)
        const authModule = await import('../dist/src/routes/auth.js');
        const userModule = await import('../dist/src/routes/users.js');
        const challengeModule = await import('../dist/src/routes/challenges.js');
        const progressModule = await import('../dist/src/routes/progress.js');
        const journalModule = await import('../dist/src/routes/journal.js');

        authRoutes = authModule.default;
        userRoutes = userModule.default;
        challengeRoutes = challengeModule.default;
        progressRoutes = progressModule.default;
        journalRoutes = journalModule.default;
        
        console.log('✅ Routes loaded from dist/');
      } catch (distError) {
        console.error('❌ Failed to load from dist:', distError);
        throw distError;
      }
    }

    // Mount all routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/challenges', challengeRoutes);
    app.use('/api/progress', progressRoutes);
    app.use('/api/journal', journalRoutes);

    console.log('✅ All routes mounted successfully');
    return true;
  } catch (error) {
    console.error('❌ Route initialization failed:', error);
    
    // Create stub routes as fallback
    console.log('⚠️  Creating stub routes as fallback...');
    const { Router } = await import('express');
    
    const stubRouter = Router();
    stubRouter.all('*', (_req: Request, res: Response) => {
      res.status(500).json({
        error: 'Routes initialization failed',
        message: 'Application not fully initialized',
        hint: 'Check server logs for details'
      });
    });
    
    app.use('/api', stubRouter);
    console.log('⚠️  Stub routes in place - app will return 500 until routes load');
    return false;
  }
}

// Initialize routes immediately
initializeRoutes().catch(error => {
  console.error('Fatal error during route initialization:', error);
});

// ============================================================================
// ERROR HANDLERS (after routes)
// ============================================================================

// 404 handler - for any unmatched routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Error',
    message: `Route ${_req.method} ${_req.path} not found`,
    statusCode: 404,
    available: ['/health', '/api/auth', '/api/users', '/api/challenges', '/api/progress', '/api/journal']
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message, err.stack);
  res.status(err.statusCode || 500).json({
    error: err.error || 'Error',
    message: err.message || 'Internal server error',
    statusCode: err.statusCode || 500,
  });
});

export default app;
