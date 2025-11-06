/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP
 */

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests from this IP, please try again later.',
    statusCode: 429,
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Authentication rate limiter
 * More strict for login/register endpoints
 * 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'TooManyRequests',
    message: 'Too many authentication attempts, please try again later.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Challenge completion rate limiter
 * Prevent spam submissions
 * 20 requests per hour
 */
export const challengeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    error: 'TooManyRequests',
    message: 'Too many challenge submissions, please try again later.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
