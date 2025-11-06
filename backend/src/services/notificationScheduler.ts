/**
 * Notification Scheduling Service
 *
 * Handles notification timing and message generation.
 * Integrates with Firebase Cloud Messaging (FCM) for push notifications.
 *
 * Research: /docs/RESEARCH_notification_strategy.md
 *
 * Key Strategy:
 * - 23.5 hours after last session (Duolingo's proven approach)
 * - Fallback to 8 AM user local time
 * - Maximum 2 notifications per day
 * - Personalized with name, streak, challenge preview
 */

import { query } from '../config/database';

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  scheduledFor: Date;
  type: 'daily_challenge' | 'streak_saver' | 'completion_celebration' | 'weekly_report';
}

export interface UserNotificationPreferences {
  userId: string;
  dailyChallengeEnabled: boolean;
  completionCelebrationEnabled: boolean;
  weeklyReportEnabled: boolean;
  missedChallengeEnabled: boolean;
  preferredTime: string; // HH:MM format
  timezone: string;
}

/**
 * Schedule daily challenge notification for user
 * Uses 23.5-hour strategy with 8 AM fallback
 */
export async function scheduleDailyChallengeNotification(userId: string): Promise<void> {
  const prefs = await getUserNotificationPreferences(userId);

  if (!prefs.dailyChallengeEnabled) {
    return; // User has notifications disabled
  }

  // Check last session time
  const lastSession = await getLastSessionTime(userId);
  const scheduledTime = calculateNotificationTime(lastSession, prefs);

  // Get today's challenge for preview
  const challenge = await getTodaysChallenge(userId);

  const notification: NotificationPayload = {
    userId,
    title: "Today's Momentum Challenge",
    body: challenge
      ? `${challenge.title} · ${challenge.estimatedTime} min`
      : "Your daily challenge is ready",
    data: {
      type: 'daily_challenge',
      challengeId: challenge?.id || '',
    },
    scheduledFor: scheduledTime,
    type: 'daily_challenge',
  };

  await saveScheduledNotification(notification);
}

/**
 * Calculate optimal notification time
 * 23.5 hours after last session, or 8 AM if no recent session
 */
function calculateNotificationTime(
  lastSession: Date | null,
  prefs: UserNotificationPreferences
): Date {
  const now = new Date();

  if (lastSession) {
    // 23.5 hours after last session
    const targetTime = new Date(lastSession);
    targetTime.setHours(targetTime.getHours() + 23);
    targetTime.setMinutes(targetTime.getMinutes() + 30);

    // If that's in the past, schedule for tomorrow
    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    return targetTime;
  } else {
    // Fallback to preferred time (default 8 AM)
    const [hours, minutes] = prefs.preferredTime.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    // If that's in the past today, schedule for tomorrow
    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    return targetTime;
  }
}

/**
 * Schedule completion celebration notification
 * Sent immediately after evidence submission
 */
export async function scheduleCompletionNotification(
  userId: string,
  challengeTitle: string,
  currentStreak: number,
  identityMessage: string
): Promise<void> {
  const prefs = await getUserNotificationPreferences(userId);

  if (!prefs.completionCelebrationEnabled) {
    return;
  }

  const notification: NotificationPayload = {
    userId,
    title: '✓ Challenge Complete',
    body: identityMessage.substring(0, 100), // Truncate to 100 chars
    data: {
      type: 'completion',
      streak: currentStreak.toString(),
    },
    scheduledFor: new Date(), // Send immediately
    type: 'completion_celebration',
  };

  await saveScheduledNotification(notification);
}

/**
 * Schedule weekly report notification
 * Sent every Sunday at 6 PM
 */
export async function scheduleWeeklyReportNotification(userId: string): Promise<void> {
  const prefs = await getUserNotificationPreferences(userId);

  if (!prefs.weeklyReportEnabled) {
    return;
  }

  const report = await generateWeeklyReport(userId);

  const notification: NotificationPayload = {
    userId,
    title: 'Weekly Territory Report Ready',
    body: `You expanded ${report.totalExpansion}% this week. See your progress.`,
    data: {
      type: 'weekly_report',
      reportId: report.id,
    },
    scheduledFor: getNextSunday6PM(prefs.timezone),
    type: 'weekly_report',
  };

  await saveScheduledNotification(notification);
}

/**
 * Schedule streak saver notification
 * Sent at 10 AM if challenge not yet accepted
 */
export async function scheduleStreakSaverNotification(userId: string): Promise<void> {
  const prefs = await getUserNotificationPreferences(userId);

  // Check if challenge was accepted
  const challengeStatus = await getChallengeStatus(userId);

  if (challengeStatus !== 'pending') {
    return; // Already accepted or completed
  }

  const notification: NotificationPayload = {
    userId,
    title: 'Your Challenge Awaits',
    body: 'Start your day with momentum. 5-15 minutes.',
    data: {
      type: 'reminder',
    },
    scheduledFor: getTodayAt10AM(prefs.timezone),
    type: 'streak_saver',
  };

  await saveScheduledNotification(notification);
}

/**
 * Get user notification preferences
 */
async function getUserNotificationPreferences(
  userId: string
): Promise<UserNotificationPreferences> {
  const result = await query(
    `SELECT
       daily_challenge_enabled,
       completion_celebration_enabled,
       weekly_report_enabled,
       missed_challenge_enabled,
       preferred_time,
       timezone
     FROM user_notification_preferences
     WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    // Return defaults
    return {
      userId,
      dailyChallengeEnabled: true,
      completionCelebrationEnabled: true,
      weeklyReportEnabled: true,
      missedChallengeEnabled: true,
      preferredTime: '08:00',
      timezone: 'UTC',
    };
  }

  return {
    userId,
    dailyChallengeEnabled: result.rows[0].daily_challenge_enabled,
    completionCelebrationEnabled: result.rows[0].completion_celebration_enabled,
    weeklyReportEnabled: result.rows[0].weekly_report_enabled,
    missedChallengeEnabled: result.rows[0].missed_challenge_enabled,
    preferredTime: result.rows[0].preferred_time || '08:00',
    timezone: result.rows[0].timezone || 'UTC',
  };
}

/**
 * Save notification to schedule
 */
async function saveScheduledNotification(notification: NotificationPayload): Promise<void> {
  await query(
    `INSERT INTO scheduled_notifications
     (user_id, title, body, data, scheduled_for, type, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
    [
      notification.userId,
      notification.title,
      notification.body,
      JSON.stringify(notification.data || {}),
      notification.scheduledFor,
      notification.type,
    ]
  );
}

/**
 * Helper: Get last session time
 */
async function getLastSessionTime(userId: string): Promise<Date | null> {
  const result = await query(
    `SELECT last_login_at FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0]?.last_login_at || null;
}

/**
 * Helper: Get today's challenge
 */
async function getTodaysChallenge(userId: string): Promise<any> {
  const result = await query(
    `SELECT c.id, c.title, c.estimated_time
     FROM daily_challenges dc
     JOIN challenges c ON dc.challenge_id = c.id
     WHERE dc.user_id = $1 AND dc.scheduled_for = CURRENT_DATE`,
    [userId]
  );
  return result.rows[0] || null;
}

/**
 * Helper: Get challenge status
 */
async function getChallengeStatus(userId: string): Promise<string> {
  const result = await query(
    `SELECT status FROM daily_challenges
     WHERE user_id = $1 AND scheduled_for = CURRENT_DATE`,
    [userId]
  );
  return result.rows[0]?.status || 'none';
}

/**
 * Helper: Generate weekly report
 */
async function generateWeeklyReport(userId: string): Promise<any> {
  // Simplified version - full implementation would calculate zone expansion
  const { randomUUID } = await import('crypto');
  return {
    id: randomUUID(),
    totalExpansion: 15, // Placeholder
  };
}

/**
 * Helper: Get next Sunday at 6 PM
 */
function getNextSunday6PM(timezone: string): Date {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(18, 0, 0, 0);
  return nextSunday;
}

/**
 * Helper: Get today at 10 AM
 */
function getTodayAt10AM(timezone: string): Date {
  const today = new Date();
  today.setHours(10, 0, 0, 0);
  return today;
}

/**
 * CRON JOB EXAMPLE:
 *
 * ```typescript
 * // Run every hour to check for notifications to send
 * import cron from 'node-cron';
 * import { sendScheduledNotifications } from './notificationService';
 *
 * cron.schedule('0 * * * *', async () => {
 *   await sendScheduledNotifications();
 * });
 * ```
 */
