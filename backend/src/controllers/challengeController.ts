/**
 * Challenge Controller
 * Handles challenge-related requests
 */

import { Request, Response } from 'express';
import {
  getTodaysChallenge,
  acceptChallenge,
  completeChallenge,
  skipChallenge,
  getChallengeHistory,
} from '../services/challengeService';
import { initializeDailyProgress } from '../services/progressService';
import { asyncHandler, AppError } from '../middleware/errorHandler';

/**
 * Get today's challenge
 * GET /api/challenges/today
 */
export const getTodaysChallengeHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Initialize today's progress entry if needed
    await initializeDailyProgress(req.user.userId);

    // Get today's challenge
    const challenge = await getTodaysChallenge(req.user.userId);

    if (!challenge) {
      res.status(404).json({
        error: 'NotFound',
        message: 'No challenge available for today',
        statusCode: 404,
      });
      return;
    }

    res.status(200).json(challenge);
  }
);

/**
 * Accept a challenge
 * POST /api/challenges/:id/accept
 */
export const acceptChallengeHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    const challenge = await acceptChallenge(req.user.userId, id);

    res.status(200).json(challenge);
  }
);

/**
 * Complete a challenge
 * POST /api/challenges/:id/complete
 * MVP: Text-only evidence (20-1000 characters)
 */
export const completeChallengeHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const { evidenceText } = req.body;

    const challenge = await completeChallenge(
      req.user.userId,
      id,
      evidenceText
    );

    res.status(200).json(challenge);
  }
);

/**
 * Skip a challenge
 * POST /api/challenges/:id/skip
 */
export const skipChallengeHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    const challenge = await skipChallenge(req.user.userId, id);

    res.status(200).json(challenge);
  }
);

/**
 * Get challenge history
 * GET /api/challenges/history
 */
export const getChallengeHistoryHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const limit = parseInt(req.query.limit as string) || 30;

    const history = await getChallengeHistory(req.user.userId, limit);

    res.status(200).json(history);
  }
);
