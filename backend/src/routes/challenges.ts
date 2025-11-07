/**
 * Challenge Routes
 * Routes for challenge management
 */

import { Router } from 'express';
import {
  getTodaysChallengeHandler,
  acceptChallengeHandler,
  completeChallengeHandler,
  skipChallengeHandler,
  getChallengeHistoryHandler,
} from '../controllers/challengeController';
import { authenticate } from '../middleware/auth';
import { validateChallengeCompletion, validate } from '../middleware/validator';
import { apiLimiter, submitLimiter } from '../middleware/rateLimiter';

const router = Router();

// All challenge routes require authentication
router.use(authenticate);

/**
 * GET /api/challenges/today
 * Get today's challenge for the authenticated user
 */
router.get('/today', apiLimiter, getTodaysChallengeHandler);

/**
 * GET /api/challenges/history
 * Get user's challenge history
 */
router.get('/history', apiLimiter, getChallengeHistoryHandler);

/**
 * POST /api/challenges/:id/accept
 * Accept a challenge
 */
router.post('/:id/accept', submitLimiter, acceptChallengeHandler);

/**
 * POST /api/challenges/:id/complete
 * Complete a challenge with evidence
 */
router.post(
  '/:id/complete',
  submitLimiter,
  validateChallengeCompletion,
  validate,
  completeChallengeHandler
);

/**
 * POST /api/challenges/:id/skip
 * Skip today's challenge
 */
router.post('/:id/skip', submitLimiter, skipChallengeHandler);

export default router;
