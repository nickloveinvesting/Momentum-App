/**
 * Progress Controller
 * Handles user progress and statistics requests
 */

import { Request, Response } from 'express';
import {
  getRangeMap,
  getStreak,
  useStreakFreeze,
  getUserStats,
} from '../services/progressService';
import { asyncHandler, AppError } from '../middleware/errorHandler';

/**
 * Get user's range map data
 * GET /api/progress/range-map
 */
export const getRangeMapHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const rangeMap = await getRangeMap(req.user.userId);

    res.status(200).json(rangeMap);
  }
);

/**
 * Get user's streak status
 * GET /api/progress/streak
 */
export const getStreakHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const streak = await getStreak(req.user.userId);

    res.status(200).json(streak);
  }
);

/**
 * Get user statistics
 * GET /api/progress/stats
 */
export const getStatsHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const stats = await getUserStats(req.user.userId);

    res.status(200).json(stats);
  }
);

/**
 * Use streak freeze
 * POST /api/progress/freeze-streak
 */
export const freezeStreakHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const streak = await useStreakFreeze(req.user.userId);

    res.status(200).json(streak);
  }
);
