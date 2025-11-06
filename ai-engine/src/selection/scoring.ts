/**
 * Challenge Personalization Scoring
 *
 * This module scores each challenge candidate based on how well it matches
 * the user's profile, context, and behavioral science best practices.
 *
 * Behavioral Science Foundation:
 * - Personalization increases engagement and completion rates
 * - Context-appropriate challenges are more likely to succeed
 * - Variety prevents habituation and maintains interest
 * - Progressive difficulty builds self-efficacy
 *
 * The scoring algorithm considers:
 * 1. Zone alignment (primary zone = higher score)
 * 2. Difficulty progression (week-appropriate difficulty)
 * 3. Time of day / user context
 * 4. Variety (penalize recent zones/difficulties)
 * 5. Avoidance score match (higher avoidance = priority)
 */

import {
  Challenge,
  ChallengeCandidate,
  AvoidanceProfile,
  AvoidanceZone,
  ChallengeDifficulty,
  User
} from '@momentum/shared';
import { getZoneScore } from '../assessment/scoring';

/**
 * Score a challenge based on how well it matches the user's profile
 *
 * Returns a score from 0-100, with reasoning for transparency.
 *
 * @param challenge The challenge to score
 * @param profile User's avoidance profile
 * @param dayNumber Current day in the program (1-28)
 * @param context Additional context for scoring
 * @returns Scored challenge with reasoning
 */
export function scoreChallenge(
  challenge: Challenge,
  profile: AvoidanceProfile,
  dayNumber: number,
  context: {
    completedZones: AvoidanceZone[]; // Zones completed in last 3 days
    completedDifficulties: ChallengeDifficulty[]; // Difficulties in last 3 days
    currentTime?: Date;
  }
): ChallengeCandidate {
  let score = 0;
  const reasons: string[] = [];

  // ========================================================================
  // 1. ZONE ALIGNMENT SCORE (0-30 points)
  // ========================================================================
  const zoneScore = getZoneScore(profile, challenge.zone);
  const zonePoints = (zoneScore / 10) * 30; // Convert 0-10 to 0-30
  score += zonePoints;

  if (challenge.zone === profile.primaryZone) {
    reasons.push(`Targets primary avoidance zone (${challenge.zone})`);
  } else if (challenge.zone === profile.secondaryZone) {
    reasons.push(`Targets secondary avoidance zone (${challenge.zone})`);
  } else {
    reasons.push(`Addresses ${challenge.zone} avoidance (score: ${zoneScore.toFixed(1)})`);
  }

  // ========================================================================
  // 2. DIFFICULTY PROGRESSION SCORE (0-25 points)
  // ========================================================================
  const weekNumber = Math.ceil(dayNumber / 7);
  const expectedDifficulty = getExpectedDifficulty(weekNumber, profile.changeStyle);

  if (challenge.difficulty === expectedDifficulty) {
    score += 25;
    reasons.push(`Perfect difficulty for week ${weekNumber} (${challenge.difficulty})`);
  } else if (isAdjacentDifficulty(challenge.difficulty, expectedDifficulty)) {
    score += 15;
    reasons.push(`Close to week ${weekNumber} difficulty target`);
  } else {
    score += 5;
    reasons.push(`Difficulty not optimal for current week`);
  }

  // ========================================================================
  // 3. TIME COMMITMENT MATCH (0-15 points)
  // ========================================================================
  const maxTime = profile.intensityPreference === '5min' ? 5 :
                  profile.intensityPreference === '10min' ? 10 : 15;

  if (challenge.estimatedTime <= maxTime && challenge.estimatedTime >= maxTime - 2) {
    // Within range and close to max preference
    score += 15;
    reasons.push(`Time commitment matches preference (${challenge.estimatedTime}min)`);
  } else if (challenge.estimatedTime <= maxTime) {
    // Within range but much shorter
    score += 10;
    reasons.push(`Shorter than preference but manageable`);
  } else {
    // Over user's stated commitment (shouldn't happen if filtered correctly)
    score += 0;
    reasons.push(`Exceeds time commitment preference`);
  }

  // ========================================================================
  // 4. VARIETY BONUS/PENALTY (0-15 points)
  // ========================================================================
  const recentZoneCount = context.completedZones.filter(z => z === challenge.zone).length;
  const recentDifficultyCount = context.completedDifficulties.filter(
    d => d === challenge.difficulty
  ).length;

  if (recentZoneCount === 0 && recentDifficultyCount === 0) {
    score += 15;
    reasons.push(`Fresh zone and difficulty combination`);
  } else if (recentZoneCount === 0 || recentDifficultyCount === 0) {
    score += 10;
    reasons.push(`Some variety from recent challenges`);
  } else if (recentZoneCount >= 2) {
    score += 0;
    reasons.push(`Zone repeated recently (variety penalty)`);
  } else {
    score += 5;
    reasons.push(`Moderate variety`);
  }

  // ========================================================================
  // 5. WEEK-SPECIFIC STRATEGIC BONUS (0-15 points)
  // ========================================================================
  // Week 1: Prefer primary zone
  // Week 2: Balanced across zones
  // Week 3: Strategic rotation based on scores
  // Week 4: Focus on biggest growth area (highest avoidance)

  if (weekNumber === 1 && challenge.zone === profile.primaryZone) {
    score += 15;
    reasons.push(`Week 1 focus on primary zone`);
  } else if (weekNumber === 2 && challenge.zone !== profile.primaryZone) {
    score += 10;
    reasons.push(`Week 2 zone rotation`);
  } else if (weekNumber === 3) {
    // Weighted preference
    const weight = getZoneScore(profile, challenge.zone) / 10;
    score += weight * 15;
    reasons.push(`Week 3 weighted selection (avoidance-driven)`);
  } else if (weekNumber === 4 && challenge.zone === profile.primaryZone) {
    score += 15;
    reasons.push(`Week 4 final push on primary zone`);
  } else {
    score += 5;
    reasons.push(`Strategic fit for current week`);
  }

  // ========================================================================
  // FINAL SCORE AND REASONING
  // ========================================================================
  return {
    challenge,
    score: Math.min(100, Math.max(0, score)),
    reasoning: reasons.join(' • ')
  };
}

/**
 * Score multiple challenges and return sorted candidates
 *
 * @param challenges Challenges to score
 * @param profile User's avoidance profile
 * @param dayNumber Current day (1-28)
 * @param context Scoring context
 * @returns Top N candidates sorted by score
 */
export function scoreAndRankChallenges(
  challenges: Challenge[],
  profile: AvoidanceProfile,
  dayNumber: number,
  context: {
    completedZones: AvoidanceZone[];
    completedDifficulties: ChallengeDifficulty[];
    currentTime?: Date;
    topN?: number;
  }
): ChallengeCandidate[] {
  // Score all challenges
  const scored = challenges.map(challenge =>
    scoreChallenge(challenge, profile, dayNumber, context)
  );

  // Sort by score (descending)
  scored.sort((a, b) => b.score - a.score);

  // Return top N (default 5)
  const topN = context.topN || 5;
  return scored.slice(0, topN);
}

/**
 * Get expected difficulty for a given week and change style
 *
 * Behavioral Science:
 * - Gradual: Slower progression, more time at each level
 * - Moderate: Standard progression (base algorithm)
 * - Aggressive: Faster progression, reach higher difficulties sooner
 *
 * @param weekNumber Week of the program (1-4)
 * @param changeStyle User's change preference
 * @returns Expected difficulty
 */
function getExpectedDifficulty(
  weekNumber: number,
  changeStyle: 'gradual' | 'moderate' | 'aggressive'
): ChallengeDifficulty {
  // Base progression (moderate)
  const baseProgression: Record<number, ChallengeDifficulty> = {
    1: 'low',
    2: 'medium-low',
    3: 'medium',
    4: 'medium-high'
  };

  // Gradual: Stay at lower levels longer
  const gradualProgression: Record<number, ChallengeDifficulty> = {
    1: 'low',
    2: 'low',
    3: 'medium-low',
    4: 'medium'
  };

  // Aggressive: Push harder faster
  const aggressiveProgression: Record<number, ChallengeDifficulty> = {
    1: 'low',
    2: 'medium',
    3: 'medium-high',
    4: 'high'
  };

  const progressionMap = {
    gradual: gradualProgression,
    moderate: baseProgression,
    aggressive: aggressiveProgression
  };

  return progressionMap[changeStyle][weekNumber] || 'medium';
}

/**
 * Check if two difficulties are adjacent in the progression
 *
 * @param difficulty1 First difficulty
 * @param difficulty2 Second difficulty
 * @returns True if adjacent
 */
function isAdjacentDifficulty(
  difficulty1: ChallengeDifficulty,
  difficulty2: ChallengeDifficulty
): boolean {
  const order: ChallengeDifficulty[] = ['low', 'medium-low', 'medium', 'medium-high', 'high'];
  const index1 = order.indexOf(difficulty1);
  const index2 = order.indexOf(difficulty2);

  return Math.abs(index1 - index2) === 1;
}

/**
 * Calculate time-of-day appropriateness score (future enhancement)
 *
 * Some challenges might be better suited for morning vs evening.
 * This is a placeholder for future context-aware scoring.
 *
 * @param challenge The challenge
 * @param currentTime Current time
 * @returns Score bonus (0-10)
 */
export function getTimeOfDayScore(challenge: Challenge, currentTime: Date): number {
  // Placeholder: could enhance with challenge metadata about ideal timing
  // For now, return neutral score
  return 5;
}

/**
 * Weighted random selection from scored candidates
 *
 * Instead of always picking the highest score, use weighted randomness
 * to introduce some variety while still favoring better matches.
 *
 * Behavioral Science:
 * Slight randomness prevents the algorithm from being too predictable,
 * which can maintain user interest and engagement.
 *
 * @param candidates Scored candidates
 * @returns Selected challenge
 */
export function weightedRandomSelection(candidates: ChallengeCandidate[]): Challenge {
  if (candidates.length === 0) {
    throw new Error('No candidates available for selection');
  }

  if (candidates.length === 1) {
    return candidates[0].challenge;
  }

  // Calculate total score for normalization
  const totalScore = candidates.reduce((sum, c) => sum + c.score, 0);

  // Generate random number
  let random = Math.random() * totalScore;

  // Select based on weighted probability
  for (const candidate of candidates) {
    random -= candidate.score;
    if (random <= 0) {
      return candidate.challenge;
    }
  }

  // Fallback: return highest scoring
  return candidates[0].challenge;
}
