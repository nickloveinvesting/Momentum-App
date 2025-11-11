/**
 * Vercel Serverless Function Entry Point
 * Self-contained handler for reliable Vercel deployment
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

// Import middleware and routes
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler';
import { publicLimiter } from '../src/middleware/rateLimiter';
import authRoutes from '../src/routes/auth';
import userRoutes from '../src/routes/users';
import challengeRoutes from '../src/routes/challenges';
import progressRoutes from '../src/routes/progress';
import journalRoutes from '../src/routes/journal';

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet());

// CORS configuration - Allow all origins for Vercel deployments
const corsOptions = {
  origin: true, // Allow all origins
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
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '2.0.0', // Updated version to confirm new code is deployed
  });
});

// Test endpoint
app.get('/api/test', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'NEW CODE DEPLOYED! Routes working!',
    path: req.path,
    originalUrl: req.originalUrl,
    method: req.method,
  });
});

// API Routes - mounted at /api/*
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/journal', journalRoutes);

// Welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Momentum API v2.0',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'production',
    routes: {
      auth: '/api/auth/register, /api/auth/login, /api/auth/me',
      users: '/api/users/*',
      challenges: '/api/challenges/*',
      progress: '/api/progress/*',
      journal: '/api/journal/*',
    },
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================================================
// EXPORT FOR VERCEL
// ============================================================================

// Log that the handler is loaded
console.log('✅ Vercel handler loaded - v2.0');
console.log('✅ Routes mounted: /api/auth, /api/users, /api/challenges, /api/progress, /api/journal');

// Export the Express app for Vercel serverless functions
export default app;
