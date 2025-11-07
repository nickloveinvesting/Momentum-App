/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP
 */

import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * STRICT: Authentication endpoints (prevent brute force)
 * 5 requests per minute per IP
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 5,                      // 5 requests
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * STANDARD: General API endpoints
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 100,                     // 100 requests
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * PUBLIC: Public endpoints (health check, docs)
 * 1000 requests per hour per IP
 */
export const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,    // 1 hour
  max: 1000,                    // 1000 requests
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

/**
 * STRICT: Challenge/Journal submission endpoints (prevent spam)
 * 20 requests per 5 minutes per user/IP
 */
export const submitLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,     // 5 minutes
  max: 20,                      // 20 requests
  message: 'Too many submissions, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
