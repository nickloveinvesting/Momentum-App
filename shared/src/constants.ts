/**
 * Shared constants for Momentum App
 */

import { AvoidanceZone, ChallengeDifficulty } from './types';

// ============================================================================
// CHALLENGE CONSTANTS
// ============================================================================

export const CHALLENGE_ZONES: AvoidanceZone[] = [
  'social',
  'physical',
  'professional',
  'emotional'
];

export const DIFFICULTY_LEVELS: ChallengeDifficulty[] = [
  'low',
  'medium-low',
  'medium',
  'medium-high',
  'high'
];

export const DIFFICULTY_PROGRESSION: Record<number, ChallengeDifficulty> = {
  1: 'low',
  2: 'medium-low',
  3: 'medium',
  4: 'medium-high'
};

export const TIME_ESTIMATES = {
  '5min': 5,
  '10min': 10,
  '15min': 15
} as const;

// ============================================================================
// RANGE MAP CONSTANTS
// ============================================================================

export const INITIAL_RANGE_RADIUS = 20; // Starting radius for all zones

export const EXPANSION_MULTIPLIERS: Record<ChallengeDifficulty, number> = {
  'low': 3,
  'medium-low': 5,
  'medium': 7,
  'medium-high': 10,
  'high': 15
};

// ============================================================================
// STREAK CONSTANTS
// ============================================================================

export const STREAK_MILESTONES = [7, 14, 21, 28, 56, 100] as const;

export const FREEZE_COOLDOWN_DAYS = 7; // One freeze per week

// ============================================================================
// NOTIFICATION TIMING (in 24-hour format)
// ============================================================================

export const NOTIFICATION_TIMES = {
  DAILY_CHALLENGE: '08:00',
  REMINDER: '10:00',
  IMPLEMENTATION_DEFAULT: '14:00',
  REFLECTION_PROMPT: '20:00',
  WEEKLY_REPORT: '18:00' // Sunday
} as const;

// ============================================================================
// REWARD PROBABILITIES
// ============================================================================

export const REWARD_DROP_CHANCE = 0.3; // 30% chance after completion

export const REWARD_CARD_DISTRIBUTION = {
  insight: 0.4,
  stat: 0.3,
  encouragement: 0.3
} as const;

// ============================================================================
// SUBSCRIPTION CONSTANTS
// ============================================================================

export const FREE_TRIAL_DAYS = 7;

export const SUBSCRIPTION_PRICES = {
  monthly: {
    amount: 299, // cents
    interval: 'month'
  },
  annual: {
    amount: 2400, // cents ($24/year)
    interval: 'year'
  }
} as const;

// ============================================================================
// ASSESSMENT CONSTANTS
// ============================================================================

export const ASSESSMENT_QUESTIONS_PER_ZONE = 5;
export const TOTAL_ASSESSMENT_QUESTIONS =
  ASSESSMENT_QUESTIONS_PER_ZONE * CHALLENGE_ZONES.length + 3; // 23 total

export const AVOIDANCE_SCORE_MIN = 0;
export const AVOIDANCE_SCORE_MAX = 10;

// ============================================================================
// API CONSTANTS
// ============================================================================

export const API_RATE_LIMITS = {
  DEFAULT: 100, // requests per 15 minutes
  AUTH: 5,      // login attempts per 15 minutes
  UPLOAD: 20    // evidence uploads per hour
} as const;

export const MAX_FILE_SIZES = {
  PHOTO: 10 * 1024 * 1024,      // 10 MB
  VOICE: 5 * 1024 * 1024,       // 5 MB
  SCREENSHOT: 5 * 1024 * 1024   // 5 MB
} as const;

// ============================================================================
// IDENTITY FRAMES (Sample)
// ============================================================================

export const IDENTITY_FRAMES = {
  social: [
    "This is what someone who values authentic connection does.",
    "This is evidence you're someone who shows up for relationships.",
    "This is what courageous communicators do."
  ],
  physical: [
    "This is what someone who respects their body does.",
    "This is evidence you're someone who embraces discomfort.",
    "This is what disciplined people do."
  ],
  professional: [
    "This is what leaders do.",
    "This is evidence you're someone who takes ownership.",
    "This is what growth-oriented professionals do."
  ],
  emotional: [
    "This is what emotionally mature people do.",
    "This is evidence you're someone who faces their truth.",
    "This is what self-aware individuals do."
  ]
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists',
  CHALLENGE_NOT_FOUND: 'Challenge not found',
  ALREADY_COMPLETED: 'Challenge already completed today',
  INVALID_EVIDENCE: 'Invalid evidence submission',
  STREAK_FREEZE_UNAVAILABLE: 'Streak freeze not available',
  SUBSCRIPTION_EXPIRED: 'Subscription expired'
} as const;

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  REFLECTION_MIN_LENGTH: 10,
  REFLECTION_MAX_LENGTH: 1000
} as const;

// ============================================================================
// CACHE TTL (in seconds)
// ============================================================================

export const CACHE_TTL = {
  USER: 300,           // 5 minutes
  CHALLENGE: 3600,     // 1 hour
  PROFILE: 1800,       // 30 minutes
  STATS: 600           // 10 minutes
} as const;
