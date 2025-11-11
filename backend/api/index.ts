/**
 * Vercel Serverless Function Entry Point
 * Vercel will compile this TypeScript file and handle all requests through it
 */

import app from '../src/vercel-handler';

// Export the Express app as the default handler
// Vercel will call this for all incoming requests
export default app;
