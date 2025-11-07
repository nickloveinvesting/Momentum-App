/**
 * Challenge Selection Filters
 *
 * This module provides filtering logic to narrow down challenge candidates.
 *
 * Behavioral Science Foundation:
 * - Avoid repetition: Doing the same challenge repeatedly reduces engagement
 * - Avoid same zone consecutively: Variety prevents fatigue and broadens growth
 * - Match difficulty to progression: Too hard = anxiety, too easy = boredom
 * - Match time commitment: Must fit user's stated capacity
 *
 * These filters implement the "Goldilocks Rule" - challenges should be
 * just right: not too hard, not too easy, not repetitive, and not overwhelming.
 */

import {
  Challenge,
  ChallengeDifficulty,
  AvoidanceZone,
  AvoidanceProfile,
  DailyChallenge,
} from '@momentum/shared';

/**
 * Filter out challenges that don't match the target difficulty
 *
 * @param challenges Available challenges
 * @param targetDifficulty The difficulty level to match
 * @returns Challenges matching the difficulty
 */
export function filterByDifficulty(
  challenges: Challenge[],
  targetDifficulty: ChallengeDifficulty
): Challenge[] {
  return challenges.filter(c => c.difficulty === targetDifficulty);
}

/**
 * Filter out challenges that don't match the target zone
 *
 * @param challenges Available challenges
 * @param targetZone The avoidance zone to match
 * @returns Challenges in the target zone
 */
export function filterByZone(
  challenges: Challenge[],
  targetZone: AvoidanceZone
): Challenge[] {
  return challenges.filter(c => c.zone === targetZone);
}

/**
 * Filter out challenges that exceed the user's time preference
 *
 * Behavioral Science:
 * Users who commit to 5min shouldn't get 15min challenges (overwhelm)
 * But users who commit to 15min can get shorter challenges (flexibility)
 *
 * @param challenges Available challenges
 * @param intensityPreference User's time commitment
 * @returns Challenges within time limit
 */
export function filterByTimeCommitment(
  challenges: Challenge[],
  intensityPreference: '5min' | '10min' | '15min'
): Challenge[] {
  const maxTime =
    intensityPreference === '5min'
      ? 5
      : intensityPreference === '10min'
        ? 10
        : 15;

  return challenges.filter(c => c.estimatedTime <= maxTime);
}

/**
 * Filter out challenges that have already been completed by the user
 *
 * Behavioral Science:
 * Repetition reduces novelty and engagement. Each challenge should feel fresh.
 * However, we might want to repeat challenges after a long gap (future enhancement).
 *
 * @param challenges Available challenges
 * @param completedChallengeIds IDs of challenges already done
 * @returns Challenges not yet completed
 */
export function filterOutCompleted(
  challenges: Challenge[],
  completedChallengeIds: string[]
): Challenge[] {
  const completedSet = new Set(completedChallengeIds);
  return challenges.filter(c => !completedSet.has(c.id));
}

/**
 * Filter out challenges from the same zone as yesterday
 *
 * Behavioral Science:
 * Zone rotation prevents burnout in one area and ensures comprehensive growth.
 * Exception: If it's the first day or no yesterday challenge, allow any zone.
 *
 * @param challenges Available challenges
 * @param yesterdayChallenge The challenge from the previous day (if any)
 * @returns Challenges from different zones
 */
export function filterOutSameZoneAsYesterday(
  challenges: Challenge[],
  yesterdayChallenge: DailyChallenge | null
): Challenge[] {
  // If no yesterday challenge, don't filter
  if (!yesterdayChallenge || !yesterdayChallenge.challenge) {
    return challenges;
  }

  const yesterdayZone = yesterdayChallenge.challenge.zone;

  // Filter out challenges from yesterday's zone
  return challenges.filter(c => c.zone !== yesterdayZone);
}

/**
 * Filter to only active challenges
 *
 * This ensures only published, ready-to-use challenges are selected.
 *
 * @param challenges All challenges
 * @returns Only active challenges
 */
export function filterActiveOnly(challenges: Challenge[]): Challenge[] {
  return challenges.filter(c => c.isActive);
}

/**
 * Apply all standard filters in sequence
 *
 * This is a convenience function that applies the most common filters.
 * Order matters: apply the most restrictive filters first for performance.
 *
 * @param challenges All available challenges
 * @param options Filtering options
 * @returns Filtered challenges
 */
export function applyStandardFilters(
  challenges: Challenge[],
  options: {
    difficulty?: ChallengeDifficulty;
    zone?: AvoidanceZone;
    timeCommitment?: '5min' | '10min' | '15min';
    completedChallengeIds: string[];
    yesterdayChallenge?: DailyChallenge | null;
    activeOnly?: boolean;
  }
): Challenge[] {
  let filtered = challenges;

  // Filter to active challenges only
  if (options.activeOnly !== false) {
    filtered = filterActiveOnly(filtered);
  }

  // Filter by difficulty if specified
  if (options.difficulty) {
    filtered = filterByDifficulty(filtered, options.difficulty);
  }

  // Filter by zone if specified
  if (options.zone) {
    filtered = filterByZone(filtered, options.zone);
  }

  // Filter by time commitment if specified
  if (options.timeCommitment) {
    filtered = filterByTimeCommitment(filtered, options.timeCommitment);
  }

  // Remove completed challenges
  filtered = filterOutCompleted(filtered, options.completedChallengeIds);

  // Avoid same zone as yesterday
  if (options.yesterdayChallenge !== undefined) {
    filtered = filterOutSameZoneAsYesterday(
      filtered,
      options.yesterdayChallenge
    );
  }

  return filtered;
}

/**
 * Get challenges that match multiple zones (for weighted selection)
 *
 * This is used when we want to select from multiple zones with different weights.
 *
 * @param challenges Available challenges
 * @param zones Array of zones to include
 * @returns Challenges from any of the specified zones
 */
export function filterByMultipleZones(
  challenges: Challenge[],
  zones: AvoidanceZone[]
): Challenge[] {
  const zoneSet = new Set(zones);
  return challenges.filter(c => zoneSet.has(c.zone));
}

/**
 * Filter challenges by multiple difficulty levels
 *
 * Useful for transitions between weeks when we might accept adjacent difficulty levels.
 *
 * @param challenges Available challenges
 * @param difficulties Array of acceptable difficulties
 * @returns Challenges matching any of the difficulties
 */
export function filterByMultipleDifficulties(
  challenges: Challenge[],
  difficulties: ChallengeDifficulty[]
): Challenge[] {
  const difficultySet = new Set(difficulties);
  return challenges.filter(c => difficultySet.has(c.difficulty));
}
