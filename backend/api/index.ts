/**
 * Vercel Serverless Handler
 * Proper entry point for Vercel deployment
 * 
 * NOTE: This file exports the Express app WITHOUT calling app.listen()
 * because Vercel's serverless environment handles the server lifecycle.
 * 
 * For local development, use src/server.ts which calls app.listen()
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

// Import configuration
import { testConnection } from '../src/config/database';
import { initSentry } from '../src/config/sentry';
import * as Sentry from '@sentry/node';

// Import middleware
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler';
import { publicLimiter } from '../src/middleware/rateLimiter';

// Import routes
import authRoutes from '../src/routes/auth';
import userRoutes from '../src/routes/users';
import challengeRoutes from '../src/routes/challenges';
import progressRoutes from '../src/routes/progress';
import journalRoutes from '../src/routes/journal';

// Load environment variables
dotenv.config();

// Initialize Sentry error tracking
initSentry();

// Create Express application
const app: Application = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Sentry request and tracing handlers (must be first)
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Security middleware
app.use(helmet());

// CORS configuration - Allow Vercel deployments and localhost
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Parse explicit CORS_ORIGIN if set
    const explicitOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : [];

    if (explicitOrigins.includes(origin) || explicitOrigins.includes('*')) {
      return callback(null, true);
    }

    // Allow all Vercel preview deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
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
} else {
  app.use(morgan('combined'));
}

// ============================================================================
// ROUTES
// ============================================================================

app.get('/health', publicLimiter, (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/journal', journalRoutes);

app.get('/', publicLimiter, (_req, res) => {
  res.json({
    message: 'Welcome to Momentum API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use(Sentry.Handlers.errorHandler());
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================================
// DATABASE INITIALIZATION (for Vercel cold start)
// ============================================================================

// Test database connection on first request
let dbInitialized = false;

app.use(async (_req, _res, next) => {
  if (!dbInitialized) {
    try {
      const connected = await testConnection();
      if (connected) {
        dbInitialized = true;
      }
    } catch (error) {
      console.error('Database connection failed during request:', error);
    }
  }
  next();
});

// ============================================================================
// EXPORT FOR VERCEL
// ============================================================================

/**
 * Export the Express app for Vercel serverless handler
 * Vercel will automatically handle the server lifecycle
 */
export default app;
