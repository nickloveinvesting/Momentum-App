/**
 * Vercel Serverless Handler - MINIMAL VERSION
 * Ultra-simple handler that works with @vercel/node
 * Gradually add routes as they're verified to work
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ============================================================================
// BASIC ROUTES
// ============================================================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Momentum Backend API',
    version: '2.0.0',
    status: 'online',
    routes: {
      health: '/health',
      info: '/'
    }
  });
});

// ============================================================================
// LAZY-LOAD ROUTES (wrap in try-catch to prevent build failure)
// ============================================================================

try {
  const authRoutes = require('../src/routes/auth').default;
  const userRoutes = require('../src/routes/users').default;
  const challengeRoutes = require('../src/routes/challenges').default;
  const progressRoutes = require('../src/routes/progress').default;
  const journalRoutes = require('../src/routes/journal').default;
  const assessmentRoutes = require('../src/routes/assessment').default;

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/challenges', challengeRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/journal', journalRoutes);
  app.use('/api/assessment', assessmentRoutes);

  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.warn('⚠️ Some routes failed to load:', error);
  // Still allow the server to start with basic routes
}

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${_req.method} ${_req.path} not found`,
    statusCode: 404
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message || err);
  res.status(err.statusCode || 500).json({
    error: err.error || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    statusCode: err.statusCode || 500
  });
});

export default app;
