/**
 * Main Server File - Local Development Entry Point
 * Starts Express server for local development
 * 
 * For Vercel deployment, use api/index.ts instead
 */

import dotenv from 'dotenv';
import { createApp } from './app';
import { testConnection } from './config/database';
import { initSentry } from './config/sentry';

dotenv.config();
initSentry();

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = createApp();

async function startServer() {
  try {
    console.log('🔌 Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('\n╔════════════════════════════════════════════╗');
      console.log('║        🚀 MOMENTUM API SERVER 🚀          ║');
      console.log('╚════════════════════════════════════════════╝\n');
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health\n`);
      console.log('✅ Ready for requests!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  process.exit(0);
});

startServer();

export default app;
