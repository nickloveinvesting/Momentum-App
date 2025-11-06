/**
 * Progress Service
 * Handles database operations for user progress tracking
 */

import { query } from '../config/database';
import { RangeMap, RangeExpansion, Streak } from '@momentum/shared';
import { AppError } from '../middleware/errorHandler';

interface RangeProgressRow {
  user_id: string;
  day_number: number;
  date: Date;
  social_radius: number;
  physical_radius: number;
  professional_radius: number;
  emotional_radius: number;
}

interface StreakRow {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: Date | null;
  freeze_available: boolean;
  freeze_used_this_week: boolean;
  updated_at: Date;
}

/**
 * Get user's range map data
 */
export async function getRangeMap(userId: string): Promise<RangeMap> {
  // Get current radius
  const currentResult = await query<RangeProgressRow>(
    `SELECT * FROM range_progress
     WHERE user_id = $1
     ORDER BY day_number DESC
     LIMIT 1`,
    [userId]
  );

  if (currentResult.rows.length === 0) {
    throw new AppError('No progress data found', 404);
  }

  const current = currentResult.rows[0];

  // Get starting radius
  const startResult = await query<RangeProgressRow>(
    `SELECT * FROM range_progress
     WHERE user_id = $1
     ORDER BY day_number ASC
     LIMIT 1`,
    [userId]
  );

  const start = startResult.rows[0];
  const startRadius = start.social_radius; // All start at same value (20)

  // Get expansion history
  const historyResult = await query<RangeProgressRow>(
    `SELECT * FROM range_progress
     WHERE user_id = $1
     ORDER BY day_number ASC`,
    [userId]
  );

  const expansionHistory: RangeExpansion[] = [];

  for (let i = 1; i < historyResult.rows.length; i++) {
    const prev = historyResult.rows[i - 1];
    const curr = historyResult.rows[i];

    // Check each zone for expansion
    const zones = ['social', 'physical', 'professional', 'emotional'] as const;
    zones.forEach((zone) => {
      const prevRadius = prev[`${zone}_radius`];
      const currRadius = curr[`${zone}_radius`];
      const expansion = currRadius - prevRadius;

      if (expansion > 0) {
        expansionHistory.push({
          day: curr.day_number,
          zone,
          expansion,
        });
      }
    });
  }

  return {
    currentRadius: {
      social: current.social_radius,
      physical: current.physical_radius,
      professional: current.professional_radius,
      emotional: current.emotional_radius,
    },
    startRadius,
    expansionHistory,
  };
}

/**
 * Get user's streak status
 */
export async function getStreak(userId: string): Promise<Streak> {
  const result = await query<StreakRow>(
    'SELECT * FROM streaks WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('No streak data found', 404);
  }

  const row = result.rows[0];

  return {
    userId: row.user_id,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastCompletedDate: row.last_completed_date ? new Date(row.last_completed_date) : undefined,
    freezeAvailable: row.freeze_available,
    freezeUsedThisWeek: row.freeze_used_this_week,
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Use streak freeze
 */
export async function useStreakFreeze(userId: string): Promise<Streak> {
  // Check if freeze is available
  const checkResult = await query<{ freeze_available: boolean }>(
    'SELECT freeze_available FROM streaks WHERE user_id = $1',
    [userId]
  );

  if (checkResult.rows.length === 0) {
    throw new AppError('No streak data found', 404);
  }

  if (!checkResult.rows[0].freeze_available) {
    throw new AppError('No freeze available', 400);
  }

  // Use the freeze
  const result = await query<StreakRow>(
    `UPDATE streaks
     SET freeze_available = false,
         freeze_used_this_week = true,
         updated_at = NOW()
     WHERE user_id = $1
     RETURNING *`,
    [userId]
  );

  const row = result.rows[0];

  return {
    userId: row.user_id,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastCompletedDate: row.last_completed_date ? new Date(row.last_completed_date) : undefined,
    freezeAvailable: row.freeze_available,
    freezeUsedThisWeek: row.freeze_used_this_week,
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<{
  totalChallenges: number;
  completedChallenges: number;
  skippedChallenges: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalExpansion: number;
}> {
  // Get challenge stats
  const challengeStats = await query<{
    total_challenges: number;
    completed_challenges: number;
    skipped_challenges: number;
  }>(
    `SELECT
       COUNT(*) as total_challenges,
       COUNT(*) FILTER (WHERE status = 'completed') as completed_challenges,
       COUNT(*) FILTER (WHERE status = 'skipped') as skipped_challenges
     FROM daily_challenges
     WHERE user_id = $1`,
    [userId]
  );

  const stats = challengeStats.rows[0];

  // Get streak stats
  const streakResult = await query<StreakRow>(
    'SELECT current_streak, longest_streak FROM streaks WHERE user_id = $1',
    [userId]
  );

  const streak = streakResult.rows[0] || { current_streak: 0, longest_streak: 0 };

  // Get total expansion
  const rangeResult = await query<RangeProgressRow>(
    `SELECT * FROM range_progress
     WHERE user_id = $1
     ORDER BY day_number DESC
     LIMIT 1`,
    [userId]
  );

  const range = rangeResult.rows[0];
  const totalExpansion = range
    ? (range.social_radius + range.physical_radius + range.professional_radius + range.emotional_radius) - 80 // Starting total is 80 (20*4)
    : 0;

  const completionRate =
    stats.total_challenges > 0
      ? (stats.completed_challenges / stats.total_challenges) * 100
      : 0;

  return {
    totalChallenges: parseInt(stats.total_challenges as any),
    completedChallenges: parseInt(stats.completed_challenges as any),
    skippedChallenges: parseInt(stats.skipped_challenges as any),
    completionRate: Math.round(completionRate * 100) / 100,
    currentStreak: streak.current_streak,
    longestStreak: streak.longest_streak,
    totalExpansion: Math.round(totalExpansion * 10) / 10,
  };
}

/**
 * Initialize daily progress entry for user
 */
export async function initializeDailyProgress(userId: string): Promise<void> {
  // Get user's day number
  const dayResult = await query<{ day_number: number }>(
    'SELECT get_user_day_number($1) as day_number',
    [userId]
  );

  const dayNumber = dayResult.rows[0].day_number;

  // Check if today's entry already exists
  const existingResult = await query(
    'SELECT id FROM range_progress WHERE user_id = $1 AND date = CURRENT_DATE',
    [userId]
  );

  if (existingResult.rows.length > 0) {
    return; // Already initialized
  }

  // Get yesterday's radius values
  const yesterdayResult = await query<RangeProgressRow>(
    `SELECT * FROM range_progress
     WHERE user_id = $1
     ORDER BY day_number DESC
     LIMIT 1`,
    [userId]
  );

  let socialRadius = 20;
  let physicalRadius = 20;
  let professionalRadius = 20;
  let emotionalRadius = 20;

  if (yesterdayResult.rows.length > 0) {
    const yesterday = yesterdayResult.rows[0];
    socialRadius = yesterday.social_radius;
    physicalRadius = yesterday.physical_radius;
    professionalRadius = yesterday.professional_radius;
    emotionalRadius = yesterday.emotional_radius;
  }

  // Create today's entry
  await query(
    `INSERT INTO range_progress (user_id, day_number, date, social_radius, physical_radius, professional_radius, emotional_radius)
     VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6)`,
    [userId, dayNumber, socialRadius, physicalRadius, professionalRadius, emotionalRadius]
  );
}
