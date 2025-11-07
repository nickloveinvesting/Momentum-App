/**
 * Main Server File
 * Express application setup and configuration
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

// Import configuration
import { testConnection } from './config/database';
import { initSentry } from './config/sentry';
import * as Sentry from '@sentry/node';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { publicLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import challengeRoutes from './routes/challenges';
import progressRoutes from './routes/progress';
import journalRoutes from './routes/journal';

// Load environment variables
dotenv.config();

// Initialize Sentry error tracking (before creating app)
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
app.use(helmet()); // Set security headers

// CORS configuration - Allow Vercel deployments and localhost
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Parse explicit CORS_ORIGIN if set (comma-separated list)
    const explicitOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : [];

    // Check if origin is explicitly allowed
    if (explicitOrigins.includes(origin) || explicitOrigins.includes('*')) {
      return callback(null, true);
    }

    // Automatically allow all Vercel preview deployments
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
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Compression middleware
app.use(compression()); // Compress responses

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Detailed logging in development
} else {
  app.use(morgan('combined')); // Standard Apache combined log format in production
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint (with public rate limiter)
app.get('/health', publicLimiter, (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/journal', journalRoutes);

// Welcome route (with public rate limiter)
app.get('/', publicLimiter, (req, res) => {
  res.json({
    message: 'Welcome to Momentum API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Sentry error handler - must be before other error handlers
app.use(Sentry.Handlers.errorHandler());

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server
 */
async function startServer() {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════╗');
      console.log('║                                            ║');
      console.log('║        🚀 MOMENTUM API SERVER 🚀          ║');
      console.log('║                                            ║');
      console.log('╚════════════════════════════════════════════╝');
      console.log('');
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('Available endpoints:');
      console.log('  Authentication:');
      console.log('    POST   /api/auth/register');
      console.log('    POST   /api/auth/login');
      console.log('    GET    /api/auth/me');
      console.log('    POST   /api/auth/logout');
      console.log('  Users:');
      console.log('    GET    /api/users/profile');
      console.log('    PUT    /api/users/profile');
      console.log('  Challenges:');
      console.log('    GET    /api/challenges/today');
      console.log('    POST   /api/challenges/:id/accept');
      console.log('    POST   /api/challenges/:id/complete');
      console.log('    POST   /api/challenges/:id/skip');
      console.log('    GET    /api/challenges/history');
      console.log('  Progress:');
      console.log('    GET    /api/progress/range-map');
      console.log('    GET    /api/progress/streak');
      console.log('    GET    /api/progress/stats');
      console.log('    POST   /api/progress/freeze-streak');
      console.log('  Journal:');
      console.log('    GET    /api/journal/entries');
      console.log('    POST   /api/journal/entry');
      console.log('    GET    /api/journal/entry/:id');
      console.log('');
      console.log('✅ Server started successfully!');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Only start the server if not running in Vercel serverless environment
// In Vercel, the app is exported and run as a serverless function
if (process.env.VERCEL !== '1' && require.main === module) {
  startServer();
}

// Export app for Vercel serverless and testing
export default app;
