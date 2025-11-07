/**
 * Recovery Messaging Service
 * Implements "Never Miss Twice" compassionate re-engagement
 *
 * Research: /docs/RESEARCH_missed_challenge_recovery.md
 *
 * Key Principles:
 * - Day 1 miss: Gentle, low-pressure
 * - Day 2 miss: Urgent but compassionate ("Never miss twice")
 * - Day 7 miss: Supportive, offer adjustments
 * - Always focus on total completions, not just streaks
 * - Use self-compassion language (never guilt/shame)
 */

import { query } from '../config/database';

export interface RecoveryMessage {
  tier: 'day1_gentle' | 'day2_urgent' | 'day7_supportive' | 'day14_reset';
  title: string;
  message: string;
  tone: 'gentle' | 'supportive' | 'direct' | 'respectful';
  urgency: 'low' | 'medium' | 'high';
  offerEasierChallenge: boolean;
  showNeverMissTwicePrinciple: boolean;
}

/**
 * Get appropriate recovery message based on consecutive misses
 */
export function getRecoveryMessage(
  consecutiveMisses: number,
  totalCompletions: number,
  userName?: string
): RecoveryMessage {
  const name = userName || 'there';

  if (consecutiveMisses === 1) {
    return {
      tier: 'day1_gentle',
      title: 'Life happens! 🌟',
      message: `Hey ${name}, you missed yesterday's challenge, but you're here now - that's what matters. Every strong person has off days. The difference? They don't let one miss become two.`,
      tone: 'gentle',
      urgency: 'low',
      offerEasierChallenge: false,
      showNeverMissTwicePrinciple: false,
    };
  } else if (consecutiveMisses === 2) {
    return {
      tier: 'day2_urgent',
      title: 'This moment matters 💙',
      message: `${name}, you've shown up ${totalCompletions} times - that's real progress. Here's a secret from research: missing once is just life. Missing twice starts a new habit of NOT doing the behavior. Let's not let that happen today.`,
      tone: 'supportive',
      urgency: 'medium',
      offerEasierChallenge: true,
      showNeverMissTwicePrinciple: true,
    };
  } else if (consecutiveMisses >= 3 && consecutiveMisses < 7) {
    return {
      tier: 'day7_supportive',
      title: 'Still here for you ✨',
      message: `${name}, you've completed ${totalCompletions} challenges. That progress is real and it's still yours. Sometimes life throws curveballs. Want to adjust your challenge difficulty or schedule? No judgment - just support.`,
      tone: 'respectful',
      urgency: 'medium',
      offerEasierChallenge: true,
      showNeverMissTwicePrinciple: false,
    };
  } else {
    return {
      tier: 'day14_reset',
      title: 'Time for a check-in',
      message: `${name}, you started this journey and completed ${totalCompletions} challenges. Every single one taught you something about yourself. Ready to try again with what you learned, or would you like to explore what's blocking you?`,
      tone: 'respectful',
      urgency: 'low',
      offerEasierChallenge: true,
      showNeverMissTwicePrinciple: false,
    };
  }
}

/**
 * Track recovery message sent
 */
export async function trackRecoveryMessageSent(
  userId: string,
  consecutiveMisses: number,
  message: RecoveryMessage
): Promise<void> {
  await query(
    `INSERT INTO recovery_messages_sent (user_id, consecutive_misses, message_tier, message_sent, sent_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [userId, consecutiveMisses, message.tier, message.message]
  );
}

/**
 * Mark recovery message as opened
 */
export async function markRecoveryMessageOpened(messageId: string): Promise<void> {
  await query(
    `UPDATE recovery_messages_sent
     SET was_opened = true
     WHERE id = $1`,
    [messageId]
  );
}

/**
 * Mark recovery message as successful (user returned)
 */
export async function markRecoveryMessageSuccessful(userId: string, messageId: string): Promise<void> {
  await query(
    `UPDATE recovery_messages_sent
     SET resulted_in_return = true, returned_at = NOW()
     WHERE id = $1 AND user_id = $2`,
    [messageId, userId]
  );
}

/**
 * Get recovery message effectiveness stats
 */
export async function getRecoveryMessageStats(): Promise<{
  tier: string;
  totalSent: number;
  openRate: number;
  returnRate: number;
}[]> {
  const result = await query<any>(
    `SELECT
      message_tier,
      COUNT(*) as total_sent,
      ROUND(COUNT(*) FILTER (WHERE was_opened = true)::NUMERIC / COUNT(*) * 100, 2) as open_rate,
      ROUND(COUNT(*) FILTER (WHERE resulted_in_return = true)::NUMERIC / COUNT(*) * 100, 2) as return_rate
     FROM recovery_messages_sent
     WHERE sent_at >= NOW() - INTERVAL '30 days'
     GROUP BY message_tier
     ORDER BY message_tier`
  );

  return result.rows.map(row => ({
    tier: row.message_tier,
    totalSent: parseInt(row.total_sent),
    openRate: parseFloat(row.open_rate || '0'),
    returnRate: parseFloat(row.return_rate || '0'),
  }));
}

/**
 * Calculate consecutive misses for user
 */
export async function getConsecutiveMisses(userId: string): Promise<number> {
  const result = await query<{ last_completed_date: Date | null }>(
    `SELECT last_completed_date FROM streaks WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0 || !result.rows[0].last_completed_date) {
    // Check if user has ever completed anything
    const completionCheck = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM daily_challenges WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );

    const hasCompletions = parseInt(completionCheck.rows[0]?.count || '0') > 0;
    return hasCompletions ? 999 : 0; // 999 = very long lapse
  }

  const lastCompleted = new Date(result.rows[0].last_completed_date);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));

  return Math.max(0, daysDiff);
}

/**
 * Get total completions for user (for display in recovery messages)
 */
export async function getTotalCompletions(userId: string): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM daily_challenges
     WHERE user_id = $1 AND status = 'completed'`,
    [userId]
  );

  return parseInt(result.rows[0]?.count || '0');
}
