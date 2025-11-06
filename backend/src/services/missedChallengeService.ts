/**
 * Missed Challenge Detection & Recovery Service
 *
 * Implements compassionate re-engagement after missed challenges.
 * Based on "Never Miss Twice" principle from habit research.
 *
 * Key Principles:
 * - Missing once has no statistical impact on long-term habit formation
 * - Missing twice begins forming a new habit of NOT doing the behavior
 * - The intervention window between miss #1 and miss #2 is critical
 * - Compassionate messaging dramatically outperforms shame-based
 *
 * Research: /docs/RESEARCH_missed_challenge_recovery.md
 */

import { query } from '../config/database';

export interface MissedChallengeStats {
  consecutiveMisses: number;
  totalMisses: number;
  lastCompletedDate: Date | null;
  daysSinceLastCompletion: number;
}

/**
 * Check for missed challenges and update status
 * Should be run daily via cron job
 */
export async function detectMissedChallenges(): Promise<void> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);

  // Find all pending challenges from yesterday
  const result = await query(
    `UPDATE daily_challenges
     SET status = 'missed'
     WHERE scheduled_for < $1
     AND status IN ('pending', 'accepted')
     RETURNING user_id, id`,
    [yesterday]
  );

  console.log(`Marked ${result.rowCount} challenges as missed`);

  // For each user with missed challenges, update their streak
  const userIds = [...new Set(result.rows.map((r: any) => r.user_id))];

  for (const userId of userIds) {
    await handleMissedChallengeForUser(userId);
  }
}

/**
 * Handle missed challenge for a specific user
 * - Reset streak if no freeze available
 * - Track consecutive misses
 * - Prepare recovery messaging
 */
async function handleMissedChallengeForUser(userId: string): Promise<void> {
  // Check if user has a freeze available
  const streakResult = await query(
    `SELECT current_streak, longest_streak, freeze_available
     FROM streaks
     WHERE user_id = $1`,
    [userId]
  );

  if (streakResult.rows.length === 0) {
    // Initialize streak if it doesn't exist
    await query(
      `INSERT INTO streaks (user_id, current_streak, longest_streak, freeze_available)
       VALUES ($1, 0, 0, false)`,
      [userId]
    );
    return;
  }

  const streak = streakResult.rows[0];

  if (streak.freeze_available) {
    // Use freeze - streak maintained
    await query(
      `UPDATE streaks
       SET freeze_available = false,
           last_freeze_used = NOW()
       WHERE user_id = $1`,
      [userId]
    );
    console.log(`User ${userId} used streak freeze`);
  } else {
    // No freeze - reset streak
    await query(
      `UPDATE streaks
       SET current_streak = 0,
           last_break_date = NOW()
       WHERE user_id = $1`,
      [userId]
    );
    console.log(`User ${userId} streak reset to 0`);
  }
}

/**
 * Get missed challenge statistics for a user
 */
export async function getMissedChallengeStats(userId: string): Promise<MissedChallengeStats> {
  // Get consecutive misses
  const consecutiveResult = await query(
    `SELECT COUNT(*) as count
     FROM daily_challenges
     WHERE user_id = $1
     AND scheduled_for >= (
       SELECT COALESCE(MAX(scheduled_for), '1970-01-01')
       FROM daily_challenges
       WHERE user_id = $1 AND status = 'completed'
     )
     AND status = 'missed'
     ORDER BY scheduled_for DESC`,
    [userId]
  );

  // Get total misses
  const totalResult = await query(
    `SELECT COUNT(*) as count
     FROM daily_challenges
     WHERE user_id = $1 AND status = 'missed'`,
    [userId]
  );

  // Get last completed date
  const lastCompletedResult = await query(
    `SELECT scheduled_for
     FROM daily_challenges
     WHERE user_id = $1 AND status = 'completed'
     ORDER BY scheduled_for DESC
     LIMIT 1`,
    [userId]
  );

  const lastCompletedDate = lastCompletedResult.rows[0]?.scheduled_for || null;
  const daysSinceLastCompletion = lastCompletedDate
    ? Math.floor((Date.now() - new Date(lastCompletedDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  return {
    consecutiveMisses: parseInt(consecutiveResult.rows[0]?.count || '0'),
    totalMisses: parseInt(totalResult.rows[0]?.count || '0'),
    lastCompletedDate,
    daysSinceLastCompletion,
  };
}

/**
 * Generate recovery message based on miss count
 * Compassionate, not guilt-based
 */
export function getRecoveryMessage(consecutiveMisses: number): RecoveryMessage {
  if (consecutiveMisses === 1) {
    // First miss - gentle, normalizing
    return {
      title: 'Your Momentum Paused',
      message: pickRandom(DAY_1_MESSAGES),
      tone: 'gentle',
      urgency: 'low',
    };
  } else if (consecutiveMisses === 2) {
    // Second miss - "Never Miss Twice" intervention
    return {
      title: 'Second Day',
      message: pickRandom(DAY_2_MESSAGES),
      tone: 'supportive',
      urgency: 'medium',
    };
  } else if (consecutiveMisses === 3) {
    // Third miss - direct, compassionate
    return {
      title: 'Ready to Restart?',
      message: pickRandom(DAY_3_MESSAGES),
      tone: 'direct',
      urgency: 'high',
    };
  } else {
    // 5+ days - last attempt, respectful
    return {
      title: 'We\'re Here When You\'re Ready',
      message: pickRandom(LONG_LAPSE_MESSAGES),
      tone: 'respectful',
      urgency: 'low',
    };
  }
}

interface RecoveryMessage {
  title: string;
  message: string;
  tone: 'gentle' | 'supportive' | 'direct' | 'respectful';
  urgency: 'low' | 'medium' | 'high';
}

// Message Banks (Compassionate, not guilt-based)
const DAY_1_MESSAGES = [
  "Your momentum paused. That happens. Ready to restart?",
  "No judgment. One day doesn't define your progress. Today is a new day.",
  "You skipped yesterday. That's okay. Let's get back to it.",
  "Life happens. The important part is what you do today.",
  "Your streak reset to 0. But your growth didn't. Ready to build again?",
];

const DAY_2_MESSAGES = [
  "Consistent people start again. That's what you're doing now.",
  "Two days paused. Let's make today different.",
  "The habit you're building is resilience, not perfection. Ready to show up today?",
  "Missing once is life. Missing twice starts a pattern. Today you choose which pattern.",
  "You're back. That's what matters. Let's rebuild together.",
];

const DAY_3_MESSAGES = [
  "Three days. The longer you wait, the harder it gets. Start today.",
  "This is the moment. Restart now, or it becomes a week. You've got this.",
  "Your past completions still count. Starting again is strength, not failure.",
  "Small action today breaks the pattern. What's one tiny step you can take?",
  "Consistent people fall down. They just don't stay down. Today, get up.",
];

const LONG_LAPSE_MESSAGES = [
  "It's been a while. No pressure—just an invitation. Ready to try again?",
  "You did this before. You can do it again. We're here when you're ready.",
  "Long breaks happen. The door is open whenever you want to walk through it.",
  "Your account is still here. Your progress is still here. You're welcome back anytime.",
  "Sometimes we need to step away. If you're ready to return, we're ready to support you.",
];

/**
 * Helper: Pick random item from array
 */
function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Should we offer a "comeback challenge" (easier than usual)?
 */
export function shouldOfferComebackChallenge(stats: MissedChallengeStats): boolean {
  // Offer easier challenge if:
  // - 2+ consecutive misses, OR
  // - 7+ days since last completion
  return stats.consecutiveMisses >= 2 || stats.daysSinceLastCompletion >= 7;
}

/**
 * Get recommended difficulty adjustment for comeback
 */
export function getComebackDifficultyAdjustment(stats: MissedChallengeStats): number {
  if (stats.consecutiveMisses >= 3 || stats.daysSinceLastCompletion >= 14) {
    return -2; // Drop 2 difficulty levels
  } else if (stats.consecutiveMisses === 2 || stats.daysSinceLastCompletion >= 7) {
    return -1; // Drop 1 difficulty level
  }
  return 0; // Normal difficulty
}

/**
 * USAGE EXAMPLE:
 *
 * ```typescript
 * // In cron job (runs daily at 12:01 AM)
 * import { detectMissedChallenges } from './services/missedChallengeService';
 * await detectMissedChallenges();
 *
 * // In dashboard component
 * import { getMissedChallengeStats, getRecoveryMessage } from './services/missedChallengeService';
 *
 * const stats = await getMissedChallengeStats(userId);
 * if (stats.consecutiveMisses > 0) {
 *   const message = getRecoveryMessage(stats.consecutiveMisses);
 *   // Show MissedChallengeBanner with message
 * }
 * ```
 */
