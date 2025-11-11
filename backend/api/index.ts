/**
 * Vercel Serverless Function Handler
 * Entry point for Vercel deployment
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';

// Import configuration
import { initSentry } from '../src/config/sentry';

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

// CORS configuration - Allow all origins for Vercel deployments
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

    // Check if origin is explicitly allowed
    if (explicitOrigins.includes(origin) || explicitOrigins.includes('*')) {
      return callback(null, true);
    }

    // Allow all Vercel deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

app.use(cors(corsOptions));

// Handle OPTIONS preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', publicLimiter, (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/journal', journalRoutes);

// Welcome route
app.get('/', publicLimiter, (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Momentum API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Sentry error handler
app.use(Sentry.Handlers.errorHandler());

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================================================
// EXPORT FOR VERCEL
// ============================================================================

// Export the Express app for Vercel serverless functions
export default app;
