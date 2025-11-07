/**
 * Challenge Service
 * Handles database operations for challenges and daily challenges
 */

import { query } from '../config/database';
import { Challenge, DailyChallenge, ChallengeStatus, EvidenceType } from '@momentum/shared';
import { AppError } from '../middleware/errorHandler';

interface ChallengeRow {
  id: string;
  title: string;
  description: string;
  zone: string;
  difficulty: string;
  estimated_time: number;
  implementation_trigger: string;
  implementation_action: string;
  identity_frame: string;
  meaning_connection: string;
  evidence_type: string;
  is_active: boolean;
  created_at: Date;
}

interface DailyChallengeRow {
  id: string;
  user_id: string;
  challenge_id: string;
  delivered_at: Date;
  scheduled_for: Date;
  status: string;
  accepted_at: Date | null;
  completed_at: Date | null;
  evidence_url: string | null;
  evidence_type: string | null;
  reflection_text: string | null;
}

/**
 * Convert database row to Challenge object
 */
function rowToChallenge(row: ChallengeRow): Challenge {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    zone: row.zone as any,
    difficulty: row.difficulty as any,
    estimatedTime: row.estimated_time,
    implementationIntention: {
      trigger: row.implementation_trigger,
      action: row.implementation_action,
    },
    identityFrame: row.identity_frame,
    meaningConnection: row.meaning_connection,
    evidenceType: row.evidence_type as EvidenceType,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
  };
}

/**
 * Convert database row to DailyChallenge object
 */
function rowToDailyChallenge(row: DailyChallengeRow, challenge?: Challenge): DailyChallenge {
  return {
    id: row.id,
    userId: row.user_id,
    challengeId: row.challenge_id,
    challenge,
    deliveredAt: new Date(row.delivered_at),
    scheduledFor: new Date(row.scheduled_for),
    status: row.status as ChallengeStatus,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    evidenceUrl: row.evidence_url || undefined,
    evidenceType: row.evidence_type as EvidenceType | undefined,
    reflectionText: row.reflection_text || undefined,
  };
}

/**
 * Get today's challenge for a user
 */
export async function getTodaysChallenge(userId: string): Promise<DailyChallenge | null> {
  const result = await query<DailyChallengeRow & ChallengeRow>(
    `SELECT dc.*, c.*
     FROM daily_challenges dc
     JOIN challenges c ON dc.challenge_id = c.id
     WHERE dc.user_id = $1 AND dc.scheduled_for = CURRENT_DATE
     LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const challenge = rowToChallenge(row);
  return rowToDailyChallenge(row, challenge);
}

/**
 * Accept a challenge
 */
export async function acceptChallenge(userId: string, challengeId: string): Promise<DailyChallenge> {
  const result = await query<DailyChallengeRow>(
    `UPDATE daily_challenges
     SET status = 'accepted', accepted_at = NOW()
     WHERE id = $1 AND user_id = $2 AND status = 'pending'
     RETURNING *`,
    [challengeId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Challenge not found or already accepted', 404);
  }

  return rowToDailyChallenge(result.rows[0]);
}

/**
 * Complete a challenge
 * MVP: Text-only evidence (OPTIONAL, 20-1000 characters when provided)
 */
export async function completeChallenge(
  userId: string,
  challengeId: string,
  evidenceText?: string
): Promise<DailyChallenge> {
  // Evidence is optional per research (optional = adherence, required = compliance)
  const result = await query<DailyChallengeRow>(
    `UPDATE daily_challenges
     SET status = 'completed',
         completed_at = NOW(),
         evidence_type = CASE WHEN $3 IS NOT NULL THEN 'text' ELSE NULL END,
         reflection_text = $3
     WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'accepted')
     RETURNING *`,
    [challengeId, userId, evidenceText || null]
  );

  if (result.rows.length === 0) {
    throw new AppError('Challenge not found or already completed', 404);
  }

  // Update streak
  await updateStreak(userId);

  // Update range progress
  await updateRangeProgress(userId, challengeId);

  // Check and award flex day (every 7 consecutive completions)
  const { checkAndAwardFlexDay } = await import('./flexDaysService');
  const flexDayAwarded = await checkAndAwardFlexDay(userId);

  if (flexDayAwarded) {
    // Track event for analytics
    await query(
      `INSERT INTO analytics_events (user_id, event, properties)
       VALUES ($1, 'flex_day_earned', $2)`,
      [userId, JSON.stringify({ timestamp: new Date() })]
    );
  }

  // Get challenge zone for difficulty and identity messaging
  const zoneResult = await query<{ zone: string }>(
    `SELECT c.zone FROM daily_challenges dc
     JOIN challenges c ON dc.challenge_id = c.id
     WHERE dc.id = $1`,
    [challengeId]
  );

  if (zoneResult.rows.length > 0) {
    const zone = zoneResult.rows[0].zone as any;

    // Update difficulty calibration
    const { updateDifficultyAfterAttempt } = await import('./difficultyCalibrationService');
    await updateDifficultyAfterAttempt(userId, zone, true);

    // Generate and store identity message
    const { generateCompletionMessage, storeIdentityMessage } = await import('./identityMessagingService');
    const identityMessage = await generateCompletionMessage(userId, zone, 'Challenge');
    await storeIdentityMessage(userId, challengeId, identityMessage);
  }

  return rowToDailyChallenge(result.rows[0]);
}

/**
 * Skip a challenge
 */
export async function skipChallenge(userId: string, challengeId: string): Promise<DailyChallenge> {
  const result = await query<DailyChallengeRow>(
    `UPDATE daily_challenges
     SET status = 'skipped'
     WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'accepted')
     RETURNING *`,
    [challengeId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Challenge not found or cannot be skipped', 404);
  }

  // Try to use flex day, otherwise reset streak
  const { useFlexDayIfAvailable } = await import('./flexDaysService');
  const flexDayUsed = await useFlexDayIfAvailable(userId);

  if (flexDayUsed) {
    // Track flex day used
    const streakResult = await query<{ current_streak: number }>(
      'SELECT current_streak FROM streaks WHERE user_id = $1',
      [userId]
    );

    const streakPreserved = streakResult.rows[0]?.current_streak || 0;

    await query(
      `INSERT INTO analytics_events (user_id, event, properties)
       VALUES ($1, 'flex_day_used', $2)`,
      [userId, JSON.stringify({ streakPreserved, timestamp: new Date() })]
    );
  } else {
    // No flex day available, reset streak
    await query(
      `UPDATE streaks
       SET current_streak = 0,
           consecutive_completions_for_flex = 0,
           updated_at = NOW()
       WHERE user_id = $1`,
      [userId]
    );
  }

  // Get challenge zone for difficulty tracking
  const zoneResult = await query<{ zone: string }>(
    `SELECT c.zone FROM daily_challenges dc
     JOIN challenges c ON dc.challenge_id = c.id
     WHERE dc.id = $1`,
    [challengeId]
  );

  if (zoneResult.rows.length > 0) {
    const zone = zoneResult.rows[0].zone as any;

    // Update difficulty calibration (mark as unsuccessful attempt)
    const { updateDifficultyAfterAttempt } = await import('./difficultyCalibrationService');
    await updateDifficultyAfterAttempt(userId, zone, false);
  }

  return rowToDailyChallenge(result.rows[0]);
}

/**
 * Get user's challenge history
 */
export async function getChallengeHistory(
  userId: string,
  limit: number = 30
): Promise<DailyChallenge[]> {
  const result = await query<DailyChallengeRow & ChallengeRow>(
    `SELECT dc.*, c.*
     FROM daily_challenges dc
     JOIN challenges c ON dc.challenge_id = c.id
     WHERE dc.user_id = $1
     ORDER BY dc.scheduled_for DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows.map((row) => {
    const challenge = rowToChallenge(row);
    return rowToDailyChallenge(row, challenge);
  });
}

/**
 * Update user streak after challenge completion
 */
async function updateStreak(userId: string): Promise<void> {
  await query(
    `UPDATE streaks
     SET current_streak = current_streak + 1,
         longest_streak = GREATEST(longest_streak, current_streak + 1),
         last_completed_date = CURRENT_DATE,
         updated_at = NOW()
     WHERE user_id = $1`,
    [userId]
  );
}

/**
 * Update range progress after challenge completion
 */
async function updateRangeProgress(userId: string, dailyChallengeId: string): Promise<void> {
  // Get the challenge zone
  const challengeResult = await query<{ zone: string }>(
    `SELECT c.zone
     FROM daily_challenges dc
     JOIN challenges c ON dc.challenge_id = c.id
     WHERE dc.id = $1`,
    [dailyChallengeId]
  );

  if (challengeResult.rows.length === 0) {
    return;
  }

  const zone = challengeResult.rows[0].zone;

  // Validate zone to prevent SQL injection
  const validZones = ['social', 'physical', 'professional', 'emotional'];
  if (!validZones.includes(zone)) {
    throw new AppError(`Invalid zone: ${zone}`, 400);
  }

  // Increment the radius for the zone (expansion of 2.5 per completion)
  // Using CASE statement to avoid SQL injection from string interpolation
  await query(
    `UPDATE range_progress
     SET social_radius = CASE WHEN $2 = 'social' THEN social_radius + 2.5 ELSE social_radius END,
         physical_radius = CASE WHEN $2 = 'physical' THEN physical_radius + 2.5 ELSE physical_radius END,
         professional_radius = CASE WHEN $2 = 'professional' THEN professional_radius + 2.5 ELSE professional_radius END,
         emotional_radius = CASE WHEN $2 = 'emotional' THEN emotional_radius + 2.5 ELSE emotional_radius END
     WHERE user_id = $1 AND date = CURRENT_DATE`,
    [userId, zone]
  );
}
