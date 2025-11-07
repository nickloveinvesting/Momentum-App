/**
 * Flex Days Service
 * Implements research-backed "streak freeze" system
 *
 * Research: /docs/RESEARCH_missed_challenge_recovery.md
 *
 * Key Mechanics:
 * - Earn 1 flex day per 7 consecutive completions
 * - Maximum 2 flex days held at once
 * - Auto-applies on missed days (preserves streak)
 * - Reduces churn by 21% (Duolingo data)
 */

import { query } from '../config/database';

export interface FlexDaysStatus {
  available: number;
  max: number;
  earnedTotal: number;
  progressToNext: number; // 0-6 completions toward next flex day
}

/**
 * Get user's flex days status
 */
export async function getFlexDaysStatus(userId: string): Promise<FlexDaysStatus> {
  const result = await query<any>(
    `SELECT
      flex_days_available,
      flex_days_max,
      flex_days_earned_total,
      consecutive_completions_for_flex
     FROM streaks
     WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return { available: 0, max: 2, earnedTotal: 0, progressToNext: 0 };
  }

  const row = result.rows[0];
  return {
    available: row.flex_days_available || 0,
    max: row.flex_days_max || 2,
    earnedTotal: row.flex_days_earned_total || 0,
    progressToNext: row.consecutive_completions_for_flex || 0,
  };
}

/**
 * Check and award flex day after challenge completion
 * Returns true if flex day was awarded
 */
export async function checkAndAwardFlexDay(userId: string): Promise<boolean> {
  const result = await query<{ check_and_award_flex_day: boolean }>(
    'SELECT check_and_award_flex_day($1) as check_and_award_flex_day',
    [userId]
  );

  return result.rows[0]?.check_and_award_flex_day || false;
}

/**
 * Use flex day to preserve streak on missed day
 * Returns true if flex day was used, false if none available
 */
export async function useFlexDayIfAvailable(userId: string): Promise<boolean> {
  const result = await query<{ use_flex_day_if_available: boolean }>(
    'SELECT use_flex_day_if_available($1) as use_flex_day_if_available',
    [userId]
  );

  return result.rows[0]?.use_flex_day_if_available || false;
}

/**
 * Get flex day earn/use history for analytics
 */
export async function getFlexDayHistory(userId: string): Promise<{
  earnedDates: Date[];
  usedDates: Date[];
}> {
  // Track in analytics_events
  const earned = await query<{ created_at: Date }>(
    `SELECT created_at
     FROM analytics_events
     WHERE user_id = $1 AND event = 'flex_day_earned'
     ORDER BY created_at DESC
     LIMIT 10`,
    [userId]
  );

  const used = await query<{ created_at: Date }>(
    `SELECT created_at
     FROM analytics_events
     WHERE user_id = $1 AND event = 'flex_day_used'
     ORDER BY created_at DESC
     LIMIT 10`,
    [userId]
  );

  return {
    earnedDates: earned.rows.map(r => r.created_at),
    usedDates: used.rows.map(r => r.created_at),
  };
}

/**
 * Track flex day earned event
 */
export async function trackFlexDayEarned(userId: string): Promise<void> {
  await query(
    `INSERT INTO analytics_events (user_id, event, properties)
     VALUES ($1, 'flex_day_earned', $2)`,
    [userId, JSON.stringify({ timestamp: new Date() })]
  );
}

/**
 * Track flex day used event
 */
export async function trackFlexDayUsed(userId: string, streakPreserved: number): Promise<void> {
  await query(
    `INSERT INTO analytics_events (user_id, event, properties)
     VALUES ($1, 'flex_day_used', $2)`,
    [userId, JSON.stringify({ timestamp: new Date(), streakPreserved })]
  );
}

/**
 * Initialize flex days for new user
 */
export async function initializeFlexDays(userId: string): Promise<void> {
  await query(
    `INSERT INTO streaks (user_id, flex_days_available, flex_days_max, flex_days_earned_total, consecutive_completions_for_flex)
     VALUES ($1, 0, 2, 0, 0)
     ON CONFLICT (user_id) DO UPDATE
     SET flex_days_available = 0, flex_days_max = 2, flex_days_earned_total = 0, consecutive_completions_for_flex = 0`,
    [userId]
  );
}
