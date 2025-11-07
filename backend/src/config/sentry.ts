/**
 * Sentry Error Monitoring Configuration
 * Tracks errors and performance in production
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

/**
 * Initialize Sentry error tracking
 * Gracefully degrades if SENTRY_DSN is not configured
 */
export const initSentry = () => {
  if (!process.env.SENTRY_DSN) {
    console.log('⚠️  SENTRY_DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      nodeProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
    serverName: 'momentum-backend-' + (process.env.VERCEL_ENV || 'unknown'),
  });

  console.log('✅ Sentry error tracking initialized');
};

export default Sentry;
