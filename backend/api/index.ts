/**
 * Vercel Serverless Handler
 * Complete Express app for Vercel deployment
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Import routes directly (they'll be compiled by Vercel)
import authRoutes from '../src/routes/auth';
import userRoutes from '../src/routes/users';
import challengeRoutes from '../src/routes/challenges';
import progressRoutes from '../src/routes/progress';
import journalRoutes from '../src/routes/journal';

dotenv.config();

const app: Application = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(helmet());

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    // Allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel deployments and localhost
    if (origin?.endsWith('.vercel.app') || 
        origin?.includes('localhost') || 
        origin?.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow explicitly configured origins
    const explicit = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [];
    if (explicit.includes(origin) || explicit.includes('*')) {
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
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'Momentum Backend API', 
    version: '2.0.0',
    routes: {
      auth: '/api/auth (register, login, me, logout)',
      users: '/api/users',
      challenges: '/api/challenges',
      progress: '/api/progress',
      journal: '/api/journal'
    }
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/journal', journalRoutes);

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${_req.method} ${_req.path} not found`,
    statusCode: 404,
    availableRoutes: {
      health: '/health',
      auth: '/api/auth/register, /api/auth/login, /api/auth/me, /api/auth/logout',
      users: '/api/users',
      challenges: '/api/challenges',
      progress: '/api/progress',
      journal: '/api/journal'
    }
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message, err.stack);
  res.status(err.statusCode || 500).json({
    error: err.error || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    statusCode: err.statusCode || 500,
  });
});

// ============================================================================
// VERCEL SERVERLESS HANDLER
// ============================================================================
// Export the app directly - Vercel's @vercel/node will handle it

export default app;
