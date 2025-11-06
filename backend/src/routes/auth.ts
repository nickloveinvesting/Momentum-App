/**
 * Authentication Routes
 * Routes for user authentication and account management
 */

import { Router } from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRegistration, validateLogin, validate } from '../middleware/validator';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', authLimiter, validateRegistration, validate, register);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', authLimiter, validateLogin, validate, login);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', authenticate, logout);

export default router;
