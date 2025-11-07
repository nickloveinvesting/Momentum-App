/**
 * Difficulty Calibration Service
 * Implements research-backed difficulty adjustment using 85/60 thresholds
 *
 * Research: /docs/RESEARCH_challenge_algorithms.md
 *
 * Key Principles:
 * - Start users one level BELOW self-assessment (reduce early frustration)
 * - Aggressive calibration first 3 sessions (±2 levels)
 * - Moderate calibration sessions 4-10 (±1 level)
 * - Standard thresholds after session 11 (87% up, 58% down with hysteresis)
 * - Per-zone tracking (each zone calibrates independently)
 */

import { query } from '../config/database';
import { AvoidanceZone } from '@momentum/shared';

export interface DifficultyLevel {
  level: number; // 1-5
  name: string;
  description: string;
  targetSuccessRate: number; // percentage
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { level: 1, name: 'Novice', description: 'Gentle first steps', targetSuccessRate: 90 },
  { level: 2, name: 'Low-Intermediate', description: 'Building confidence', targetSuccessRate: 85 },
  { level: 3, name: 'Intermediate', description: 'Steady growth', targetSuccessRate: 80 },
  { level: 4, name: 'High-Intermediate', description: 'Pushing boundaries', targetSuccessRate: 75 },
  { level: 5, name: 'Advanced', description: 'Significant challenge', targetSuccessRate: 70 },
];

interface DifficultyTracking {
  userId: string;
  zone: AvoidanceZone;
  currentDifficultyLevel: number;
  totalAttempts: number;
  totalCompletions: number;
  recentSuccessRate: number;
  sessionsAtCurrentLevel: number;
  lastLevelChangeAt: Date | null;
}

/**
 * Get current difficulty level for user in specific zone
 */
export async function getUserDifficultyLevel(
  userId: string,
  zone: AvoidanceZone
): Promise<number> {
  const result = await query<{ current_difficulty_level: number }>(
    `SELECT current_difficulty_level
     FROM challenge_difficulty_tracking
     WHERE user_id = $1 AND zone = $2`,
    [userId, zone]
  );

  // Default to level 2 if not found (one below intermediate)
  return result.rows.length > 0 ? result.rows[0].current_difficulty_level : 2;
}

/**
 * Get difficulty tracking stats for user in zone
 */
export async function getDifficultyTracking(
  userId: string,
  zone: AvoidanceZone
): Promise<DifficultyTracking | null> {
  const result = await query<any>(
    `SELECT *
     FROM challenge_difficulty_tracking
     WHERE user_id = $1 AND zone = $2`,
    [userId, zone]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    userId: row.user_id,
    zone: row.zone,
    currentDifficultyLevel: row.current_difficulty_level,
    totalAttempts: row.total_attempts,
    totalCompletions: row.total_completions,
    recentSuccessRate: parseFloat(row.recent_success_rate || '0'),
    sessionsAtCurrentLevel: row.sessions_at_current_level,
    lastLevelChangeAt: row.last_level_change_at,
  };
}

/**
 * Update difficulty calibration after challenge attempt
 * Uses database function for complex logic
 */
export async function updateDifficultyAfterAttempt(
  userId: string,
  zone: AvoidanceZone,
  completed: boolean
): Promise<void> {
  await query(
    'SELECT update_difficulty_calibration($1, $2, $3)',
    [userId, zone, completed]
  );
}

/**
 * Get recommended difficulty level for new challenge
 * Factors in:
 * - Current calibrated level
 * - Recent performance trends
 * - Sessions at current level (prevent stagnation)
 */
export async function getRecommendedDifficulty(
  userId: string,
  zone: AvoidanceZone
): Promise<number> {
  const tracking = await getDifficultyTracking(userId, zone);

  if (!tracking) {
    // No tracking yet - start at level 2 (one below middle)
    return 2;
  }

  // Return current calibrated level
  return tracking.currentDifficultyLevel;
}

/**
 * Initialize difficulty tracking for new user
 * Start at level 2 for all zones (one below middle, per research)
 */
export async function initializeDifficultyTracking(userId: string): Promise<void> {
  const zones: AvoidanceZone[] = ['social', 'physical', 'professional', 'emotional'];

  for (const zone of zones) {
    await query(
      `INSERT INTO challenge_difficulty_tracking (user_id, zone, current_difficulty_level)
       VALUES ($1, $2, 2)
       ON CONFLICT (user_id, zone) DO NOTHING`,
      [userId, zone]
    );
  }
}

/**
 * Get difficulty adjustment insights for user dashboard
 */
export async function getDifficultyInsights(userId: string): Promise<{
  zone: AvoidanceZone;
  currentLevel: number;
  levelName: string;
  recentSuccessRate: number;
  totalAttempts: number;
  progressToNextLevel: string;
}[]> {
  const result = await query<any>(
    `SELECT zone, current_difficulty_level, recent_success_rate, total_attempts, sessions_at_current_level
     FROM challenge_difficulty_tracking
     WHERE user_id = $1
     ORDER BY zone`,
    [userId]
  );

  return result.rows.map(row => {
    const level = DIFFICULTY_LEVELS.find(d => d.level === row.current_difficulty_level) || DIFFICULTY_LEVELS[1];
    const successRate = parseFloat(row.recent_success_rate || '0');
    const sessions = row.sessions_at_current_level;

    let progressMsg = '';
    if (successRate >= 87 && sessions >= 5 && row.current_difficulty_level < 5) {
      progressMsg = 'Ready for next level soon!';
    } else if (successRate <= 58 && sessions >= 3 && row.current_difficulty_level > 1) {
      progressMsg = 'May adjust difficulty lower';
    } else {
      progressMsg = `Building consistency (${sessions} sessions)`;
    }

    return {
      zone: row.zone,
      currentLevel: row.current_difficulty_level,
      levelName: level.name,
      recentSuccessRate: successRate,
      totalAttempts: row.total_attempts,
      progressToNextLevel: progressMsg,
    };
  });
}

/**
 * Map old text-based difficulty to new numeric levels
 */
export function mapTextDifficultyToLevel(textDifficulty: string): number {
  const mapping: Record<string, number> = {
    'low': 1,
    'medium-low': 2,
    'medium': 3,
    'medium-high': 4,
    'high': 5,
  };

  return mapping[textDifficulty] || 3;
}
