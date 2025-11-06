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
import { challengeLimiter } from '../middleware/rateLimiter';

const router = Router();

// All challenge routes require authentication
router.use(authenticate);

/**
 * GET /api/challenges/today
 * Get today's challenge for the authenticated user
 */
router.get('/today', getTodaysChallengeHandler);

/**
 * GET /api/challenges/history
 * Get user's challenge history
 */
router.get('/history', getChallengeHistoryHandler);

/**
 * POST /api/challenges/:id/accept
 * Accept a challenge
 */
router.post('/:id/accept', acceptChallengeHandler);

/**
 * POST /api/challenges/:id/complete
 * Complete a challenge with evidence
 */
router.post(
  '/:id/complete',
  challengeLimiter,
  validateChallengeCompletion,
  validate,
  completeChallengeHandler
);

/**
 * POST /api/challenges/:id/skip
 * Skip today's challenge
 */
router.post('/:id/skip', skipChallengeHandler);

export default router;
