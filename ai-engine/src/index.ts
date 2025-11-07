/**
 * Momentum App - AI Personalization Engine
 *
 * This module provides intelligent challenge selection and personalization
 * for the Momentum app's 28-day behavioral change program.
 *
 * Main Features:
 * 1. Assessment Generation & Scoring
 * 2. Challenge Selection Algorithm
 * 3. Implementation Intention Generation
 *
 * Usage:
 * ```typescript
 * import {
 *   generateAssessment,
 *   scoreAssessment,
 *   selectDailyChallenge,
 *   generateImplementationIntention
 * } from '@momentum/ai-engine';
 * ```
 */

// ============================================================================
// ASSESSMENT EXPORTS
// ============================================================================

export {
  generateAssessment,
  getQuestionsByZone,
  getIntensityQuestions,
  mapAnswerToScore,
} from './assessment/questions';

export {
  scoreAssessment,
  getZoneScore,
  getAllZoneScores,
  calculateZoneWeights,
} from './assessment/scoring';

// ============================================================================
// CHALLENGE SELECTION EXPORTS
// ============================================================================

export {
  selectDailyChallenge,
  previewChallengeSequence,
} from './selection/algorithm';

export {
  scoreChallenge,
  scoreAndRankChallenges,
  weightedRandomSelection,
  getTimeOfDayScore,
} from './selection/scoring';

export {
  filterByDifficulty,
  filterByZone,
  filterByTimeCommitment,
  filterOutCompleted,
  filterOutSameZoneAsYesterday,
  filterActiveOnly,
  applyStandardFilters,
  filterByMultipleZones,
  filterByMultipleDifficulties,
} from './selection/filters';

// ============================================================================
// IMPLEMENTATION INTENTION EXPORTS
// ============================================================================

export {
  generateImplementationIntention,
  generateIntentionOptions,
  recommendTriggerTime,
  validateIntention,
  generateIntentionReminder,
} from './intentions/generator';

// ============================================================================
// RE-EXPORT SHARED TYPES FOR CONVENIENCE
// ============================================================================

export type {
  AssessmentQuestion,
  AssessmentAnswer,
  AssessmentResult,
  AvoidanceProfile,
  AvoidanceZone,
  AvoidanceScores,
  Challenge,
  ChallengeDifficulty,
  ChallengeSelectionContext,
  ChallengeCandidate,
  ImplementationIntention,
  User,
} from '@momentum/shared';
