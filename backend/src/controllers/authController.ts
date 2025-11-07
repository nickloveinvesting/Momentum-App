/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

import { Request, Response } from 'express';
import { RegisterRequest, LoginRequest, AuthResponse } from '@momentum/shared';
import { createUser, verifyPassword, findUserById } from '../services/userService';
import { generateToken } from '../config/jwt';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, timezone }: RegisterRequest = req.body;

  // Create user in database
  const user = await createUser(email, password, name, timezone || 'UTC');

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  // Send response
  const response: AuthResponse = {
    user,
    token,
  };

  res.status(201).json(response);
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginRequest = req.body;

  // Verify credentials
  const user = await verifyPassword(email, password);

  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid email or password',
      statusCode: 401,
    });
    return;
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  // Send response
  const response: AuthResponse = {
    user,
    token,
  };

  res.status(200).json(response);
});

/**
 * Get current user
 * GET /api/auth/me
 * Requires authentication
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // User is attached to request by auth middleware
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
      statusCode: 401,
    });
    return;
  }

  // Get user from database
  const user = await findUserById(req.user.userId);

  if (!user) {
    res.status(404).json({
      error: 'NotFound',
      message: 'User not found',
      statusCode: 404,
    });
    return;
  }

  res.status(200).json(user);
});

/**
 * Logout user
 * POST /api/auth/logout
 * Note: JWT is stateless, so logout is handled client-side by removing token
 * This endpoint exists for consistency and future server-side session management
 */
export const logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    message: 'Logged out successfully',
  });
});
