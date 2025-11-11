/**
 * Assessment Routes
 * Routes for assessment submission and profile management
 */

import { Router } from 'express';
import { submitAssessment, getProfile } from '../controllers/assessmentController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// All assessment routes require authentication
router.use(authenticate);

/**
 * POST /api/assessment/submit
 * Submit assessment answers and create/update avoidance profile
 */
router.post('/submit', apiLimiter, submitAssessment);

/**
 * GET /api/assessment/profile
 * Get user's avoidance profile
 */
router.get('/profile', apiLimiter, getProfile);

export default router;
