/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@momentum/shared';

/**
 * Custom error class with status code
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * Catches all errors and sends appropriate response
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal server error';

  // Check if it's our custom error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  } else if (err.message) {
    message = err.message;
  }

  // Log error for debugging
  console.error('Error:', {
    statusCode,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Send error response
  const errorResponse: ApiError = {
    error: err.name || 'Error',
    message,
    statusCode,
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
