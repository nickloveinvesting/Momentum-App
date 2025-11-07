/**
 * Identity Messaging Service
 * Implements identity-based behavior reinforcement
 *
 * Research: /docs/RESEARCH_identity_reinforcement.md
 *
 * Key Principles:
 * - Days 1-7: "You're becoming someone who..."
 * - Day 8+: "You're someone who..."
 * - Zone-specific identity frames
 * - Pattern recognition messaging
 * - 3x more effective than "Good job!" messages
 */

import { query } from '../config/database';
import { AvoidanceZone } from '@momentum/shared';

export interface IdentityMessage {
  type: 'completion' | 'milestone' | 'pattern_recognition' | 'weekly_summary';
  identityText: string;
  zone: AvoidanceZone;
  completionsCount: number;
  daysActive: number;
}

/**
 * Get identity frame for zone (from challenges table)
 */
export async function getZoneIdentityFrame(zone: AvoidanceZone): Promise<string> {
  const result = await query<{ identity_frame: string }>(
    `SELECT identity_frame
     FROM challenges
     WHERE zone = $1 AND is_active = true
     LIMIT 1`,
    [zone]
  );

  if (result.rows.length > 0) {
    return result.rows[0].identity_frame;
  }

  // Fallback identity frames
  const fallbacks: Record<AvoidanceZone, string> = {
    social: "You're someone who invests in relationships",
    physical: "You're someone who honors their body",
    professional: "You're someone who pursues growth",
    emotional: "You're someone who embraces all emotions",
  };

  return fallbacks[zone];
}

/**
 * Generate identity message after challenge completion
 */
export async function generateCompletionMessage(
  userId: string,
  zone: AvoidanceZone,
  challengeTitle: string
): Promise<IdentityMessage> {
  // Get user's completion count and days active
  const stats = await query<any>(
    `SELECT
      COUNT(*) FILTER (WHERE status = 'completed') as completions,
      COUNT(*) FILTER (WHERE status = 'completed' AND c.zone = $2) as zone_completions,
      (CURRENT_DATE - DATE(u.created_at)) as days_active
     FROM daily_challenges dc
     JOIN challenges c ON dc.challenge_id = c.id
     JOIN users u ON dc.user_id = u.id
     WHERE dc.user_id = $1
     GROUP BY u.created_at`,
    [userId, zone]
  );

  const totalCompletions = parseInt(stats.rows[0]?.completions || '0');
  const zoneCompletions = parseInt(stats.rows[0]?.zone_completions || '0');
  const daysActive = parseInt(stats.rows[0]?.days_active || '0');

  const identityFrame = await getZoneIdentityFrame(zone);

  let identityText: string;

  // Days 1-7: "Becoming" language
  if (daysActive <= 7 || zoneCompletions <= 3) {
    identityText = `You're becoming someone who ${identityFrame.toLowerCase().replace("you're someone who ", "")}`;
  }
  // Day 8+: "You are" language (identity consolidated)
  else {
    identityText = identityFrame;
  }

  // Add zone-specific momentum indicator
  const momentumIndicator = getMomentumIndicator(zone);
  identityText = `${momentumIndicator} ${identityText}`;

  return {
    type: 'completion',
    identityText,
    zone,
    completionsCount: totalCompletions,
    daysActive,
  };
}

/**
 * Generate milestone identity message
 */
export async function generateMilestoneMessage(
  userId: string,
  milestone: number,
  zone?: AvoidanceZone
): Promise<IdentityMessage> {
  const stats = await query<any>(
    `SELECT (CURRENT_DATE - DATE(created_at)) as days_active FROM users WHERE id = $1`,
    [userId]
  );

  const daysActive = parseInt(stats.rows[0]?.days_active || '0');

  let identityText: string;

  if (milestone === 7) {
    identityText = "You're proving who you are. 7 days of showing up - that's commitment.";
  } else if (milestone === 14) {
    identityText = "You're someone who keeps promises to themselves. 14 days strong.";
  } else if (milestone === 30) {
    identityText = "You're building a new identity. 30 days of consistent action speaks louder than any words.";
  } else if (milestone === 100) {
    identityText = "You're an example of what persistence looks like. 100 challenges completed.";
  } else {
    identityText = `${milestone} completions. You're someone who follows through.`;
  }

  return {
    type: 'milestone',
    identityText,
    zone: zone || 'social',
    completionsCount: milestone,
    daysActive,
  };
}

/**
 * Generate pattern recognition message
 */
export async function generatePatternRecognitionMessage(
  userId: string,
  zone: AvoidanceZone,
  pattern: string
): Promise<IdentityMessage> {
  const stats = await query<any>(
    `SELECT
      COUNT(*) FILTER (WHERE status = 'completed' AND c.zone = $2) as zone_completions,
      (CURRENT_DATE - DATE(u.created_at)) as days_active
     FROM daily_challenges dc
     JOIN challenges c ON dc.challenge_id = c.id
     JOIN users u ON dc.user_id = u.id
     WHERE dc.user_id = $1
     GROUP BY u.created_at`,
    [userId, zone]
  );

  const zoneCompletions = parseInt(stats.rows[0]?.zone_completions || '0');
  const daysActive = parseInt(stats.rows[0]?.days_active || '0');

  const identityFrame = await getZoneIdentityFrame(zone);

  const identityText = `This is your ${pattern}. ${identityFrame}. You're not just doing this - you're becoming this.`;

  return {
    type: 'pattern_recognition',
    identityText,
    zone,
    completionsCount: zoneCompletions,
    daysActive,
  };
}

/**
 * Store identity message in database
 */
export async function storeIdentityMessage(
  userId: string,
  dailyChallengeId: string | null,
  message: IdentityMessage
): Promise<void> {
  await query(
    `INSERT INTO identity_messages (user_id, daily_challenge_id, message_type, identity_text, zone, completions_count, days_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      userId,
      dailyChallengeId,
      message.type,
      message.identityText,
      message.zone,
      message.completionsCount,
      message.daysActive,
    ]
  );
}

/**
 * Mark identity message as read
 */
export async function markIdentityMessageRead(messageId: string): Promise<void> {
  await query(
    `UPDATE identity_messages SET was_read = true WHERE id = $1`,
    [messageId]
  );
}

/**
 * Get recent unread identity messages
 */
export async function getUnreadIdentityMessages(userId: string, limit: number = 5): Promise<any[]> {
  const result = await query<any>(
    `SELECT * FROM identity_messages
     WHERE user_id = $1 AND was_read = false
     ORDER BY shown_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows;
}

/**
 * Get momentum indicator emoji/text for zone
 */
function getMomentumIndicator(zone: AvoidanceZone): string {
  const indicators: Record<AvoidanceZone, string> = {
    social: '🤝 Social Momentum +',
    physical: '💪 Physical Momentum +',
    professional: '🚀 Professional Momentum +',
    emotional: '💙 Emotional Momentum +',
  };

  return indicators[zone];
}

/**
 * Check for notable patterns to celebrate
 * Examples: "5th time this month", "3 weeks in a row", etc.
 */
export async function detectNotablePattern(
  userId: string,
  zone: AvoidanceZone
): Promise<string | null> {
  // Check for X completions this month in zone
  const monthResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM daily_challenges dc
     JOIN challenges c ON dc.challenge_id = c.id
     WHERE dc.user_id = $1
       AND c.zone = $2
       AND dc.status = 'completed'
       AND dc.completed_at >= DATE_TRUNC('month', CURRENT_DATE)`,
    [userId, zone]
  );

  const monthCount = parseInt(monthResult.rows[0]?.count || '0');

  if (monthCount % 5 === 0 && monthCount > 0) {
    return `${monthCount}th time this month`;
  }

  // Check for weekly consistency
  const weekResult = await query<{ weeks: string }>(
    `SELECT COUNT(DISTINCT DATE_TRUNC('week', dc.completed_at)) as weeks
     FROM daily_challenges dc
     JOIN challenges c ON dc.challenge_id = c.id
     WHERE dc.user_id = $1
       AND c.zone = $2
       AND dc.status = 'completed'
       AND dc.completed_at >= CURRENT_DATE - INTERVAL '3 weeks'`,
    [userId, zone]
  );

  const consecutiveWeeks = parseInt(weekResult.rows[0]?.weeks || '0');

  if (consecutiveWeeks >= 3) {
    return `${consecutiveWeeks} weeks in a row`;
  }

  return null;
}
