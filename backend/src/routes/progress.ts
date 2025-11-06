/**
 * Progress Routes
 * Routes for user progress tracking and statistics
 */

import { Router } from 'express';
import {
  getRangeMapHandler,
  getStreakHandler,
  getStatsHandler,
  freezeStreakHandler,
} from '../controllers/progressController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All progress routes require authentication
router.use(authenticate);

/**
 * GET /api/progress/range-map
 * Get user's range map data showing capability expansion
 */
router.get('/range-map', getRangeMapHandler);

/**
 * GET /api/progress/streak
 * Get user's current streak status
 */
router.get('/streak', getStreakHandler);

/**
 * GET /api/progress/stats
 * Get user's overall statistics
 */
router.get('/stats', getStatsHandler);

/**
 * POST /api/progress/freeze-streak
 * Use a streak freeze to protect current streak
 */
router.post('/freeze-streak', freezeStreakHandler);

export default router;
