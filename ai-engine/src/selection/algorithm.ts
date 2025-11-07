/**
 * Challenge Selection Algorithm
 *
 * This is the main algorithm that selects the optimal daily challenge for a user.
 *
 * Behavioral Science Foundation:
 * The algorithm implements a 4-week progression based on:
 * 1. Progressive Overload: Gradually increase difficulty
 * 2. Zone Rotation: Prevent burnout, ensure comprehensive growth
 * 3. Personalization: Match user's avoidance profile
 * 4. Variety: Prevent habituation and boredom
 * 5. Self-Efficacy Building: Start with wins, build confidence
 *
 * Week-by-Week Strategy:
 * - Week 1 (Days 1-7): LOW difficulty, PRIMARY zone focus
 *   Goal: Build confidence with early wins in biggest avoidance area
 *
 * - Week 2 (Days 8-14): MEDIUM-LOW difficulty, ZONE ROTATION
 *   Goal: Introduce variety, expand to other zones, maintain momentum
 *
 * - Week 3 (Days 15-21): MEDIUM difficulty, WEIGHTED ROTATION
 *   Goal: Deeper challenges, weighted by avoidance scores
 *
 * - Week 4 (Days 22-28): MEDIUM-HIGH difficulty, GROWTH FOCUS
 *   Goal: Final push on primary zone, consolidate gains
 *
 * The algorithm also respects:
 * - No repeated challenges
 * - No same zone 2 days in a row
 * - User's time commitment preference
 * - Change style (gradual/moderate/aggressive)
 */

import {
  Challenge,
  User,
  AvoidanceProfile,
  AvoidanceZone,
  ChallengeDifficulty,
  ChallengeSelectionContext,
  DailyChallenge,
} from '@momentum/shared';
import { applyStandardFilters, filterByMultipleZones } from './filters';
import { scoreAndRankChallenges, weightedRandomSelection } from './scoring';
import { getZoneScore, calculateZoneWeights } from '../assessment/scoring';

/**
 * Select the optimal daily challenge for a user
 *
 * This is the main entry point for challenge selection.
 *
 * @param context All context needed for selection
 * @param availableChallenges All challenges in the database
 * @param recentChallenges Recent daily challenges for context (last 3-7 days)
 * @returns The selected challenge
 */
export function selectDailyChallenge(
  context: ChallengeSelectionContext,
  availableChallenges: Challenge[],
  recentChallenges: DailyChallenge[] = []
): Challenge {
  const { user, profile, dayNumber, completedChallenges, currentTime } =
    context;

  // ========================================================================
  // STEP 1: Determine target difficulty based on week and change style
  // ========================================================================
  const weekNumber = Math.ceil(dayNumber / 7);
  const targetDifficulty = getTargetDifficulty(weekNumber, profile.changeStyle);

  // ========================================================================
  // STEP 2: Determine target zone(s) based on week strategy
  // ========================================================================
  const targetZones = getTargetZones(weekNumber, profile, recentChallenges);

  // ========================================================================
  // STEP 3: Apply filters to narrow down candidates
  // ========================================================================
  const yesterdayChallenge = getYesterdayChallenge(recentChallenges);

  // First, filter to active challenges matching difficulty and time
  let candidates = applyStandardFilters(availableChallenges, {
    difficulty: targetDifficulty,
    timeCommitment: profile.intensityPreference,
    completedChallengeIds: completedChallenges,
    yesterdayChallenge,
    activeOnly: true,
  });

  // If we have target zones, filter to those zones
  if (targetZones.length > 0) {
    const zoneCandidates = filterByMultipleZones(candidates, targetZones);
    // Only use zone filter if it doesn't eliminate all candidates
    if (zoneCandidates.length > 0) {
      candidates = zoneCandidates;
    }
  }

  // ========================================================================
  // STEP 4: If no candidates, fall back with relaxed constraints
  // ========================================================================
  if (candidates.length === 0) {
    candidates = fallbackSelection(
      availableChallenges,
      completedChallenges,
      profile,
      yesterdayChallenge
    );
  }

  // ========================================================================
  // STEP 5: Score and rank candidates
  // ========================================================================
  const recentContext = buildScoringContext(recentChallenges);
  const rankedCandidates = scoreAndRankChallenges(
    candidates,
    profile,
    dayNumber,
    {
      ...recentContext,
      currentTime,
      topN: 5, // Get top 5 candidates
    }
  );

  if (rankedCandidates.length === 0) {
    throw new Error('No suitable challenges found for user');
  }

  // ========================================================================
  // STEP 6: Use weighted random selection from top candidates
  // ========================================================================
  // This adds slight randomness while still favoring high scores
  const selectedChallenge = weightedRandomSelection(rankedCandidates);

  return selectedChallenge;
}

/**
 * Get target difficulty based on week and change style
 *
 * @param weekNumber Week of the program (1-4)
 * @param changeStyle User's change preference
 * @returns Target difficulty
 */
function getTargetDifficulty(
  weekNumber: number,
  changeStyle: 'gradual' | 'moderate' | 'aggressive'
): ChallengeDifficulty {
  // Gradual progression: slower ramp-up
  const gradualProgression: Record<number, ChallengeDifficulty> = {
    1: 'low',
    2: 'low',
    3: 'medium-low',
    4: 'medium',
  };

  // Moderate progression: standard algorithm
  const moderateProgression: Record<number, ChallengeDifficulty> = {
    1: 'low',
    2: 'medium-low',
    3: 'medium',
    4: 'medium-high',
  };

  // Aggressive progression: faster ramp-up
  const aggressiveProgression: Record<number, ChallengeDifficulty> = {
    1: 'low',
    2: 'medium',
    3: 'medium-high',
    4: 'high',
  };

  const progressionMap = {
    gradual: gradualProgression,
    moderate: moderateProgression,
    aggressive: aggressiveProgression,
  };

  return progressionMap[changeStyle][weekNumber] || 'medium';
}

/**
 * Get target zones based on week strategy
 *
 * Week 1: Primary zone only
 * Week 2: All zones except primary (rotation)
 * Week 3: All zones (weighted by avoidance scores)
 * Week 4: Primary and secondary zones (consolidation)
 *
 * @param weekNumber Week of the program
 * @param profile User's avoidance profile
 * @param recentChallenges Recent challenges for context
 * @returns Array of target zones
 */
function getTargetZones(
  weekNumber: number,
  profile: AvoidanceProfile,
  recentChallenges: DailyChallenge[]
): AvoidanceZone[] {
  const allZones: AvoidanceZone[] = [
    'social',
    'physical',
    'professional',
    'emotional',
  ];

  switch (weekNumber) {
    case 1:
      // Week 1: Focus on primary zone for confidence building
      return [profile.primaryZone];

    case 2:
      // Week 2: Rotate through other zones (avoid primary zone fatigue)
      // But still include primary if it's been a few days
      const lastPrimaryDay = getLastZoneDay(
        recentChallenges,
        profile.primaryZone
      );
      if (lastPrimaryDay === -1 || lastPrimaryDay >= 3) {
        // Allow primary if it's been 3+ days
        return allZones;
      } else {
        // Exclude primary, focus on other zones
        return allZones.filter(z => z !== profile.primaryZone);
      }

    case 3:
      // Week 3: All zones (weighted selection in scoring)
      return allZones;

    case 4:
      // Week 4: Focus on primary and secondary (final push)
      return [profile.primaryZone, profile.secondaryZone];

    default:
      return allZones;
  }
}

/**
 * Get yesterday's challenge from recent challenges
 *
 * @param recentChallenges Recent daily challenges
 * @returns Yesterday's challenge or null
 */
function getYesterdayChallenge(
  recentChallenges: DailyChallenge[]
): DailyChallenge | null {
  if (recentChallenges.length === 0) {
    return null;
  }

  // Sort by scheduled date (descending)
  const sorted = [...recentChallenges].sort(
    (a, b) =>
      new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
  );

  return sorted[0] || null;
}

/**
 * Get the last day a specific zone was used
 *
 * @param recentChallenges Recent challenges
 * @param zone Zone to check
 * @returns Days ago (0 = today, 1 = yesterday, -1 = not found)
 */
function getLastZoneDay(
  recentChallenges: DailyChallenge[],
  zone: AvoidanceZone
): number {
  const sorted = [...recentChallenges].sort(
    (a, b) =>
      new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
  );

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].challenge?.zone === zone) {
      return i;
    }
  }

  return -1; // Not found in recent challenges
}

/**
 * Build scoring context from recent challenges
 *
 * @param recentChallenges Recent challenges (last 3-7 days)
 * @returns Context for scoring
 */
function buildScoringContext(recentChallenges: DailyChallenge[]): {
  completedZones: AvoidanceZone[];
  completedDifficulties: ChallengeDifficulty[];
} {
  const completedZones: AvoidanceZone[] = [];
  const completedDifficulties: ChallengeDifficulty[] = [];

  // Get last 3 challenges for variety scoring
  const last3 = recentChallenges
    .sort(
      (a, b) =>
        new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
    )
    .slice(0, 3);

  last3.forEach(dc => {
    if (dc.challenge) {
      completedZones.push(dc.challenge.zone);
      completedDifficulties.push(dc.challenge.difficulty);
    }
  });

  return { completedZones, completedDifficulties };
}

/**
 * Fallback selection when no candidates meet all criteria
 *
 * This progressively relaxes constraints to ensure we always find a challenge.
 *
 * @param availableChallenges All challenges
 * @param completedChallengeIds Completed challenge IDs
 * @param profile User profile
 * @param yesterdayChallenge Yesterday's challenge
 * @returns Array of fallback candidates
 */
function fallbackSelection(
  availableChallenges: Challenge[],
  completedChallengeIds: string[],
  profile: AvoidanceProfile,
  yesterdayChallenge: DailyChallenge | null
): Challenge[] {
  // Try progressively relaxed constraints

  // 1. Remove difficulty constraint, keep time and zone constraints
  let candidates = applyStandardFilters(availableChallenges, {
    timeCommitment: profile.intensityPreference,
    completedChallengeIds,
    yesterdayChallenge,
    activeOnly: true,
  });

  if (candidates.length > 0) return candidates;

  // 2. Remove zone rotation constraint
  candidates = applyStandardFilters(availableChallenges, {
    timeCommitment: profile.intensityPreference,
    completedChallengeIds,
    activeOnly: true,
  });

  if (candidates.length > 0) return candidates;

  // 3. Remove time constraint (allow longer challenges if needed)
  candidates = applyStandardFilters(availableChallenges, {
    completedChallengeIds,
    activeOnly: true,
  });

  if (candidates.length > 0) return candidates;

  // 4. Last resort: allow completed challenges (re-do)
  // This should rarely happen
  candidates = applyStandardFilters(availableChallenges, {
    completedChallengeIds: [], // Don't filter out completed
    activeOnly: true,
  });

  return candidates;
}

/**
 * Preview the next N days of challenges (for testing/debugging)
 *
 * This is useful for seeing how the algorithm will behave over time.
 *
 * @param context Selection context
 * @param availableChallenges All challenges
 * @param days Number of days to preview
 * @returns Array of selected challenges
 */
export function previewChallengeSequence(
  context: ChallengeSelectionContext,
  availableChallenges: Challenge[],
  days: number = 7
): Challenge[] {
  const sequence: Challenge[] = [];
  const completedIds = [...context.completedChallenges];

  for (let i = 0; i < days; i++) {
    const dayContext = {
      ...context,
      dayNumber: context.dayNumber + i,
      completedChallenges: completedIds,
    };

    // Create mock recent challenges for context
    const recentChallenges: DailyChallenge[] = sequence
      .slice(-3)
      .map((challenge, idx) => ({
        id: `preview-${i - idx}`,
        userId: context.user.id,
        challengeId: challenge.id,
        challenge,
        deliveredAt: new Date(),
        scheduledFor: new Date(),
        status: 'completed' as const,
        completedAt: new Date(),
      }));

    const selected = selectDailyChallenge(
      dayContext,
      availableChallenges,
      recentChallenges
    );
    sequence.push(selected);
    completedIds.push(selected.id);
  }

  return sequence;
}
