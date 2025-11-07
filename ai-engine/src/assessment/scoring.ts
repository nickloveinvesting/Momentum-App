/**
 * Assessment Scoring Logic
 *
 * This module calculates avoidance profiles from assessment answers.
 *
 * Behavioral Science Foundation:
 * - Avoidance scores (0-10) indicate the severity of avoidance patterns
 * - Higher scores = more avoidance = higher priority for intervention
 * - Primary zone = area with most avoidance (highest score)
 * - Secondary zone = second-highest area for rotation in later weeks
 * - Intensity preference determines challenge difficulty progression
 *
 * The scoring algorithm:
 * 1. Averages responses per zone (5 questions each)
 * 2. Identifies primary and secondary zones
 * 3. Determines time preference (5/10/15 min)
 * 4. Calculates change style (gradual/moderate/aggressive)
 */

import {
  AssessmentAnswer,
  AvoidanceProfile,
  AvoidanceZone,
  AvoidanceScores,
  AVOIDANCE_SCORE_MIN,
  AVOIDANCE_SCORE_MAX,
} from '@momentum/shared';
import { generateAssessment, mapAnswerToScore } from './questions';

/**
 * Calculate avoidance scores from assessment answers
 *
 * This function processes all answers and generates a complete avoidance profile.
 * The profile determines which challenges the user receives and in what order.
 *
 * @param userId The user's ID
 * @param answers Array of assessment answers
 * @returns Complete avoidance profile
 */
export function scoreAssessment(
  userId: string,
  answers: AssessmentAnswer[]
): AvoidanceProfile {
  const questions = generateAssessment();

  // Create a map of questionId -> answer for quick lookup
  const answerMap = new Map<string, string | number>();
  answers.forEach(answer => {
    answerMap.set(answer.questionId, answer.value);
  });

  // Calculate scores for each avoidance zone
  const scores = calculateZoneScores(answerMap);

  // Determine primary and secondary zones (highest avoidance areas)
  const { primary, secondary } = determinePrimaryZones(scores);

  // Extract intensity preferences from the last 3 questions
  const intensityPreference = determineIntensityPreference(answerMap);
  const changeStyle = determineChangeStyle(answerMap);

  // Construct and return the avoidance profile
  return {
    userId,
    socialScore: scores.social,
    physicalScore: scores.physical,
    professionalScore: scores.professional,
    emotionalScore: scores.emotional,
    primaryZone: primary,
    secondaryZone: secondary,
    intensityPreference,
    changeStyle,
    assessedAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Calculate avoidance scores for each zone
 *
 * Averages the 5 questions per zone to get a 0-10 score.
 * Higher scores indicate more avoidance in that area.
 *
 * @param answerMap Map of questionId to answer value
 * @returns Scores for each avoidance zone
 */
function calculateZoneScores(
  answerMap: Map<string, string | number>
): AvoidanceScores {
  const questions = generateAssessment();
  const zones: AvoidanceZone[] = [
    'social',
    'physical',
    'professional',
    'emotional',
  ];

  const scores: AvoidanceScores = {
    social: 0,
    physical: 0,
    professional: 0,
    emotional: 0,
  };

  zones.forEach(zone => {
    // Get all questions for this zone (excluding intensity questions)
    const zoneQuestions = questions.filter(
      q => q.category === zone && !q.id.startsWith('intensity_')
    );

    // Calculate average score for this zone
    let totalScore = 0;
    let answeredCount = 0;

    zoneQuestions.forEach(question => {
      const answer = answerMap.get(question.id);
      if (answer !== undefined) {
        const score = mapAnswerToScore(question, answer);
        totalScore += score;
        answeredCount++;
      }
    });

    // Average the scores (default to 5 if no answers)
    if (answeredCount > 0) {
      scores[zone] = Math.min(
        AVOIDANCE_SCORE_MAX,
        Math.max(AVOIDANCE_SCORE_MIN, totalScore / answeredCount)
      );
    } else {
      // Default to middle score if zone not answered
      scores[zone] = 5;
    }
  });

  return scores;
}

/**
 * Determine primary and secondary avoidance zones
 *
 * Primary zone = highest avoidance score (first target)
 * Secondary zone = second-highest score (rotation target)
 *
 * Behavioral Science:
 * - Start with the area of greatest avoidance (most impact)
 * - Use secondary zone for variety and comprehensive growth
 *
 * @param scores Avoidance scores for each zone
 * @returns Primary and secondary zones
 */
function determinePrimaryZones(scores: AvoidanceScores): {
  primary: AvoidanceZone;
  secondary: AvoidanceZone;
} {
  // Convert scores to sorted array
  const sortedZones = (Object.keys(scores) as AvoidanceZone[])
    .map(zone => ({ zone, score: scores[zone] }))
    .sort((a, b) => b.score - a.score); // Descending order (highest first)

  // Handle tie-breaking for primary zone
  const primary = sortedZones[0].zone;

  // Secondary is the second-highest (or third if tied with primary)
  let secondary = sortedZones[1].zone;

  // Ensure secondary is different from primary
  if (secondary === primary && sortedZones.length > 2) {
    secondary = sortedZones[2].zone;
  }

  return { primary, secondary };
}

/**
 * Determine intensity preference (time commitment)
 *
 * Maps to challenge duration: 5min, 10min, or 15min
 * This affects which challenges are selected for the user.
 *
 * @param answerMap Map of questionId to answer value
 * @returns Intensity preference
 */
function determineIntensityPreference(
  answerMap: Map<string, string | number>
): '5min' | '10min' | '15min' {
  const answer = answerMap.get('intensity_01');

  if (!answer || typeof answer !== 'string') {
    return '10min'; // Default to moderate
  }

  // Map answer to time preference
  if (answer.includes('5 minutes')) {
    return '5min';
  } else if (answer.includes('15 minutes')) {
    return '15min';
  } else {
    return '10min';
  }
}

/**
 * Determine change style (difficulty progression rate)
 *
 * Behavioral Science:
 * - Gradual: Slow progression, more repetition at each level
 * - Moderate: Standard progression (default algorithm)
 * - Aggressive: Faster difficulty increase, more challenge variety
 *
 * This affects how quickly difficulty ramps up across the 28 days.
 *
 * @param answerMap Map of questionId to answer value
 * @returns Change style
 */
function determineChangeStyle(
  answerMap: Map<string, string | number>
): 'gradual' | 'moderate' | 'aggressive' {
  // Analyze both intensity_02 and intensity_03 for comprehensive assessment
  const answer2 = answerMap.get('intensity_02');
  const answer3 = answerMap.get('intensity_03');

  let gradualCount = 0;
  let aggressiveCount = 0;

  // Count indicators for each style
  if (typeof answer2 === 'string') {
    if (answer2.includes('Gradual')) gradualCount++;
    if (answer2.includes('Aggressive')) aggressiveCount++;
  }

  if (typeof answer3 === 'string') {
    if (answer3.includes('ease into it slowly')) gradualCount++;
    if (answer3.includes('thrive on challenge')) aggressiveCount++;
  }

  // Determine style based on counts
  if (gradualCount > aggressiveCount) {
    return 'gradual';
  } else if (aggressiveCount > gradualCount) {
    return 'aggressive';
  } else {
    return 'moderate'; // Default to moderate
  }
}

/**
 * Get avoidance score for a specific zone from profile
 *
 * @param profile The user's avoidance profile
 * @param zone The zone to get score for
 * @returns Score (0-10)
 */
export function getZoneScore(
  profile: AvoidanceProfile,
  zone: AvoidanceZone
): number {
  switch (zone) {
    case 'social':
      return profile.socialScore;
    case 'physical':
      return profile.physicalScore;
    case 'professional':
      return profile.professionalScore;
    case 'emotional':
      return profile.emotionalScore;
  }
}

/**
 * Get all zone scores as an object
 *
 * @param profile The user's avoidance profile
 * @returns Scores for all zones
 */
export function getAllZoneScores(profile: AvoidanceProfile): AvoidanceScores {
  return {
    social: profile.socialScore,
    physical: profile.physicalScore,
    professional: profile.professionalScore,
    emotional: profile.emotionalScore,
  };
}

/**
 * Calculate weighted zone probabilities for challenge selection
 *
 * Behavioral Science:
 * Higher avoidance scores should have higher probability of selection,
 * but not deterministic (use weighted randomness for variety).
 *
 * @param profile The user's avoidance profile
 * @returns Object mapping zone to selection weight
 */
export function calculateZoneWeights(
  profile: AvoidanceProfile
): Record<AvoidanceZone, number> {
  const scores = getAllZoneScores(profile);

  // Calculate total score for normalization
  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );

  // Avoid division by zero
  if (totalScore === 0) {
    return {
      social: 0.25,
      physical: 0.25,
      professional: 0.25,
      emotional: 0.25,
    };
  }

  // Convert scores to weights (higher score = higher weight)
  return {
    social: scores.social / totalScore,
    physical: scores.physical / totalScore,
    professional: scores.professional / totalScore,
    emotional: scores.emotional / totalScore,
  };
}
