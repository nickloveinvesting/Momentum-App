/**
 * User Routes
 * Routes for user profile management
 */

import { Router } from 'express';
import { getUserProfile, updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateProfileUpdate, validate } from '../middleware/validator';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', getUserProfile);

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile', validateProfileUpdate, validate, updateProfile);

export default router;
