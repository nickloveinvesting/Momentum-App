/**
 * Notification Timing Service
 * Implements 23.5-hour personalized timing strategy
 *
 * Research: /docs/RESEARCH_notification_strategy.md
 *
 * Key Features:
 * - 23.5-hour timing (send when user checked in yesterday)
 * - Quiet hours enforcement (10pm-8am default)
 * - Frequency caps (max 2 per day)
 * - Time zone handling
 * - Dismissal tracking (auto-reduce after 3 dismissals)
 */

import { query } from '../config/database';

export interface NotificationPreferences {
  enabled: boolean;
  preferredTime: string; // HH:MM format
  quietHoursStart: string; // HH:MM format
  quietHoursEnd: string; // HH:MM format
  frequencyCap: number; // max per day
}

export interface NotificationTiming {
  shouldSend: boolean;
  recommendedTime: Date | null;
  reason: string;
  withinQuietHours: boolean;
}

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const result = await query<any>(
    `SELECT
      notification_enabled,
      preferred_challenge_time,
      quiet_hours_start,
      quiet_hours_end,
      notification_frequency_cap
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    // Default preferences
    return {
      enabled: true,
      preferredTime: '08:30',
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      frequencyCap: 2,
    };
  }

  const row = result.rows[0];
  return {
    enabled: row.notification_enabled !== false,
    preferredTime: row.preferred_challenge_time || '08:30',
    quietHoursStart: row.quiet_hours_start || '22:00',
    quietHoursEnd: row.quiet_hours_end || '08:00',
    frequencyCap: row.notification_frequency_cap || 2,
  };
}

/**
 * Calculate optimal notification time using 23.5-hour strategy
 * Send notification at same time user checked in yesterday
 */
export async function calculateOptimalNotificationTime(userId: string): Promise<Date | null> {
  // Get user's last session time
  const result = await query<{ last_session_at: Date }>(
    `SELECT last_session_at FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0 || !result.rows[0].last_session_at) {
    // Fallback to preferred time
    const prefs = await getNotificationPreferences(userId);
    const [hours, minutes] = prefs.preferredTime.split(':').map(Number);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);

    return tomorrow;
  }

  // 23.5 hours after last session
  const lastSession = new Date(result.rows[0].last_session_at);
  const optimalTime = new Date(lastSession.getTime() + (23.5 * 60 * 60 * 1000));

  return optimalTime;
}

/**
 * Check if notification should be sent now
 */
export async function shouldSendNotification(
  userId: string,
  notificationType: 'daily_reminder' | 'streak_saver' | 'milestone' | 'recovery'
): Promise<NotificationTiming> {
  const prefs = await getNotificationPreferences(userId);

  // Check if notifications enabled
  if (!prefs.enabled) {
    return {
      shouldSend: false,
      recommendedTime: null,
      reason: 'Notifications disabled by user',
      withinQuietHours: false,
    };
  }

  // Check frequency cap (notifications sent today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sentToday = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM analytics_events
     WHERE user_id = $1
       AND event = 'notification_sent'
       AND created_at >= $2`,
    [userId, today]
  );

  const notificationsSentToday = parseInt(sentToday.rows[0]?.count || '0');

  if (notificationsSentToday >= prefs.frequencyCap) {
    return {
      shouldSend: false,
      recommendedTime: null,
      reason: `Frequency cap reached (${prefs.frequencyCap} per day)`,
      withinQuietHours: false,
    };
  }

  // Check quiet hours
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const isQuietHours = isWithinQuietHours(currentTime, prefs.quietHoursStart, prefs.quietHoursEnd);

  if (isQuietHours && notificationType !== 'recovery') {
    // Recovery messages can be sent during quiet hours (less strict)
    const optimalTime = await calculateOptimalNotificationTime(userId);

    return {
      shouldSend: false,
      recommendedTime: optimalTime,
      reason: 'Within quiet hours (10pm-8am)',
      withinQuietHours: true,
    };
  }

  // Check if user opened app recently (within last hour)
  const recentSession = await query<{ last_session_at: Date }>(
    `SELECT last_session_at FROM users WHERE id = $1`,
    [userId]
  );

  if (recentSession.rows.length > 0 && recentSession.rows[0].last_session_at) {
    const lastSession = new Date(recentSession.rows[0].last_session_at);
    const hourAgo = new Date(Date.now() - (60 * 60 * 1000));

    if (lastSession > hourAgo) {
      return {
        shouldSend: false,
        recommendedTime: null,
        reason: 'User opened app within last hour',
        withinQuietHours: false,
      };
    }
  }

  // All checks passed
  return {
    shouldSend: true,
    recommendedTime: now,
    reason: 'All checks passed',
    withinQuietHours: false,
  };
}

/**
 * Track notification sent
 */
export async function trackNotificationSent(
  userId: string,
  notificationType: string,
  message: string
): Promise<void> {
  await query(
    `INSERT INTO analytics_events (user_id, event, properties)
     VALUES ($1, 'notification_sent', $2)`,
    [userId, JSON.stringify({ type: notificationType, message, timestamp: new Date() })]
  );
}

/**
 * Track notification dismissed
 */
export async function trackNotificationDismissed(userId: string): Promise<void> {
  await query(
    `INSERT INTO analytics_events (user_id, event, properties)
     VALUES ($1, 'notification_dismissed', $2)`,
    [userId, JSON.stringify({ timestamp: new Date() })]
  );

  // Check if user has dismissed 3+ in a row
  const recentDismissals = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM analytics_events
     WHERE user_id = $1
       AND event = 'notification_dismissed'
       AND created_at >= NOW() - INTERVAL '24 hours'`,
    [userId]
  );

  const dismissals = parseInt(recentDismissals.rows[0]?.count || '0');

  // Auto-reduce frequency after 3 dismissals
  if (dismissals >= 3) {
    await query(
      `UPDATE users
       SET notification_frequency_cap = GREATEST(notification_frequency_cap - 1, 1)
       WHERE id = $1`,
      [userId]
    );
  }
}

/**
 * Update user's last session timestamp (for 23.5h timing)
 */
export async function updateLastSession(userId: string): Promise<void> {
  await query(
    `UPDATE users SET last_session_at = NOW() WHERE id = $1`,
    [userId]
  );
}

/**
 * Helper: Check if time is within quiet hours
 */
function isWithinQuietHours(currentTime: string, quietStart: string, quietEnd: string): boolean {
  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (quietStart > quietEnd) {
    return currentTime >= quietStart || currentTime < quietEnd;
  }

  // Handle same-day quiet hours (e.g., 01:00 - 05:00)
  return currentTime >= quietStart && currentTime < quietEnd;
}

/**
 * Get next recommended notification time
 */
export async function getNextNotificationTime(userId: string): Promise<Date | null> {
  const prefs = await getNotificationPreferences(userId);

  if (!prefs.enabled) {
    return null;
  }

  // Use 23.5-hour strategy
  return await calculateOptimalNotificationTime(userId);
}
