/**
 * Request Validation Middleware
 * Uses express-validator to validate request data
 */

import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';

/**
 * Middleware to check validation results
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    throw new AppError(`Validation error: ${errorMessages}`, 400);
  }

  next();
};

/**
 * Registration validation rules
 */
export const validateRegistration: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a valid string'),
];

/**
 * Login validation rules
 */
export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Profile update validation rules
 */
export const validateProfileUpdate: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a valid string'),
];

/**
 * Challenge completion validation rules
 */
export const validateChallengeCompletion: ValidationChain[] = [
  body('evidenceType')
    .isIn(['photo', 'screenshot', 'voice', 'honor'])
    .withMessage('Evidence type must be one of: photo, screenshot, voice, honor'),
  body('evidenceUrl')
    .optional()
    .isURL()
    .withMessage('Evidence URL must be a valid URL'),
  body('reflectionText')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Reflection text must not exceed 1000 characters'),
];

/**
 * Journal entry validation rules
 */
export const validateJournalEntry: ValidationChain[] = [
  body('dailyChallengeId')
    .isUUID()
    .withMessage('Daily challenge ID must be a valid UUID'),
  body('reflectionText')
    .trim()
    .notEmpty()
    .withMessage('Reflection text is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reflection text must be between 10 and 1000 characters'),
];
