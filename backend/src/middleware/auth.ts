/**
 * Authentication Middleware
 * Validates JWT tokens and protects routes
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../config/jwt';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to verify JWT token and authenticate user
 * Expects token in Authorization header as "Bearer <token>"
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided. Please provide a valid JWT token.',
        statusCode: 401,
      });
      return;
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Invalid or expired token',
      statusCode: 401,
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that have different behavior for authenticated users
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
