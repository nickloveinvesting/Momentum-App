/**
 * Vercel Serverless Handler
 * Proper entry point for Vercel deployment
 * 
 * NOTE: This file exports the Express app WITHOUT calling app.listen()
 * because Vercel's serverless environment handles the server lifecycle.
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Express app first
const app: Application = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);
    
    const explicitOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : [];

    if (explicitOrigins.includes(origin) || explicitOrigins.includes('*')) {
      return callback(null, true);
    }
    if (origin.endsWith('.vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
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
}

// ============================================================================
// LAZY LOAD DEPENDENCIES (avoid circular imports)
// ============================================================================

// Lazy load routes to ensure proper initialization
async function loadRoutes() {
  try {
    // Use require instead of import to avoid path resolution issues
    const authRoutes = require('../src/routes/auth').default;
    const userRoutes = require('../src/routes/users').default;
    const challengeRoutes = require('../src/routes/challenges').default;
    const progressRoutes = require('../src/routes/progress').default;
    const journalRoutes = require('../src/routes/journal').default;
    
    console.log('✅ Routes loaded successfully');
    
    return {
      authRoutes,
      userRoutes,
      challengeRoutes,
      progressRoutes,
      journalRoutes,
    };
  } catch (error) {
    console.error('❌ Failed to load routes:', error);
    throw error;
  }
}

// ============================================================================
// ROUTES - Register synchronously
// ============================================================================

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Momentum API',
    version: '1.0.0',
  });
});

// Dynamically load and mount routes on first request
let routesLoaded = false;

app.use(async (req, res, next) => {
  if (!routesLoaded) {
    try {
      const routes = await loadRoutes();
      
      app.use('/api/auth', routes.authRoutes);
      app.use('/api/users', routes.userRoutes);
      app.use('/api/challenges', routes.challengeRoutes);
      app.use('/api/progress', routes.progressRoutes);
      app.use('/api/journal', routes.journalRoutes);
      
      routesLoaded = true;
      console.log('✅ Routes mounted');
    } catch (error) {
      console.error('❌ Failed to mount routes:', error);
      return res.status(500).json({ error: 'Failed to initialize routes' });
    }
  }
  next();
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: 'Error',
    message: 'Route not found',
    statusCode: 404,
  });
});

// Global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Error:', err);
  
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
