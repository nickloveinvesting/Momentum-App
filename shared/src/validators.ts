/**
 * Validation schemas using Zod
 */

import { z } from 'zod';
import { VALIDATION } from './constants';

// ============================================================================
// AUTH VALIDATORS
// ============================================================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(
    VALIDATION.PASSWORD_MIN_LENGTH,
    `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
  ),
  name: z.string()
    .min(VALIDATION.NAME_MIN_LENGTH, 'Name is too short')
    .max(VALIDATION.NAME_MAX_LENGTH, 'Name is too long'),
  timezone: z.string().min(1, 'Timezone is required')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// ============================================================================
// ASSESSMENT VALIDATORS
// ============================================================================

export const assessmentAnswerSchema = z.object({
  questionId: z.string().uuid(),
  value: z.union([
    z.number().min(0).max(10),
    z.string().min(1)
  ])
});

export const assessmentSubmissionSchema = z.object({
  answers: z.array(assessmentAnswerSchema).min(1)
});

// ============================================================================
// CHALLENGE VALIDATORS
// ============================================================================

export const challengeCompletionSchema = z.object({
  evidenceType: z.enum(['photo', 'screenshot', 'voice', 'honor']),
  evidenceUrl: z.string().url().optional(),
  reflectionText: z.string()
    .min(VALIDATION.REFLECTION_MIN_LENGTH, 'Reflection is too short')
    .max(VALIDATION.REFLECTION_MAX_LENGTH, 'Reflection is too long')
    .optional()
});

// ============================================================================
// JOURNAL VALIDATORS
// ============================================================================

export const journalEntrySchema = z.object({
  reflectionText: z.string()
    .min(VALIDATION.REFLECTION_MIN_LENGTH, 'Reflection is too short')
    .max(VALIDATION.REFLECTION_MAX_LENGTH, 'Reflection is too long')
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AssessmentSubmissionInput = z.infer<typeof assessmentSubmissionSchema>;
export type ChallengeCompletionInput = z.infer<typeof challengeCompletionSchema>;
export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
