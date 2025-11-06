/**
 * User Controller
 * Handles user profile management
 */

import { Request, Response } from 'express';
import { findUserById, updateUserProfile } from '../services/userService';
import { asyncHandler, AppError } from '../middleware/errorHandler';

/**
 * Get user profile
 * GET /api/users/profile
 */
export const getUserProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await findUserById(req.user.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json(user);
  }
);

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { name, timezone } = req.body;

    const updates: Partial<{ name: string; timezone: string }> = {};

    if (name !== undefined) {
      updates.name = name;
    }

    if (timezone !== undefined) {
      updates.timezone = timezone;
    }

    const user = await updateUserProfile(req.user.userId, updates);

    res.status(200).json(user);
  }
);
