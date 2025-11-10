/**
 * Challenge Assignment Service
 * Assigns daily challenges to users based on their avoidance profile and difficulty
 */

import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface AvoidanceProfile {
  social_score: number;
  physical_score: number;
  professional_score: number;
  emotional_score: number;
  primary_zone: string;
  secondary_zone: string;
}

/**
 * Get user's avoidance profile
 */
async function getAvoidanceProfile(userId: string): Promise<AvoidanceProfile | null> {
  const result = await query<AvoidanceProfile>(
    `SELECT social_score, physical_score, professional_score, emotional_score,
            primary_zone, secondary_zone
     FROM avoidance_profiles
     WHERE user_id = $1`,
    [userId]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Determine which zone to select a challenge from
 * Prioritizes primary zone, then secondary zone, then rotates through all zones
 */
function selectTargetZone(profile: AvoidanceProfile | null, dayNumber: number): string {
  if (!profile) {
    // For users without a profile, rotate through zones
    const zones = ['social', 'physical', 'professional', 'emotional'];
    return zones[dayNumber % zones.length];
  }

  // Alternate between primary and secondary zones
  return dayNumber % 2 === 0 ? profile.primary_zone : profile.secondary_zone;
}

/**
 * Determine difficulty level based on user's day number
 * Days 1-7: low difficulty
 * Days 8-21: medium difficulty
 * Days 22+: mix of medium and high difficulty
 */
function selectDifficulty(dayNumber: number): string {
  if (dayNumber <= 7) {
    return 'low';
  } else if (dayNumber <= 21) {
    return 'medium';
  } else {
    // Alternate between medium and high for advanced users
    return dayNumber % 3 === 0 ? 'high' : 'medium';
  }
}

/**
 * Assign a daily challenge to a user for today
 * This should be called once per day per user (via cron job or on-demand)
 */
export async function assignDailyChallenge(userId: string): Promise<void> {
  // Check if user already has a challenge for today
  const existingChallenge = await query(
    `SELECT id FROM daily_challenges
     WHERE user_id = $1 AND scheduled_for = CURRENT_DATE`,
    [userId]
  );

  if (existingChallenge.rows.length > 0) {
    // Already has a challenge for today
    return;
  }

  // Get user's day number
  const dayNumberResult = await query<{ day_number: number }>(
    `SELECT get_user_day_number($1) as day_number`,
    [userId]
  );

  const dayNumber = dayNumberResult.rows[0]?.day_number || 0;

  // Get user's avoidance profile
  const profile = await getAvoidanceProfile(userId);

  // Determine target zone and difficulty
  const targetZone = selectTargetZone(profile, dayNumber);
  const difficulty = selectDifficulty(dayNumber);

  // Get challenges the user hasn't completed recently (last 30 days)
  const challengeResult = await query(
    `SELECT c.id
     FROM challenges c
     WHERE c.zone = $1
       AND c.difficulty = $2
       AND c.is_active = true
       AND c.id NOT IN (
         SELECT challenge_id
         FROM daily_challenges
         WHERE user_id = $3
           AND scheduled_for > CURRENT_DATE - INTERVAL '30 days'
       )
     ORDER BY RANDOM()
     LIMIT 1`,
    [targetZone, difficulty, userId]
  );

  if (challengeResult.rows.length === 0) {
    // No available challenges for this zone/difficulty combo
    // Fall back to any challenge in the zone
    const fallbackResult = await query(
      `SELECT c.id
       FROM challenges c
       WHERE c.zone = $1
         AND c.is_active = true
       ORDER BY RANDOM()
       LIMIT 1`,
      [targetZone]
    );

    if (fallbackResult.rows.length === 0) {
      throw new AppError(`No challenges available for zone: ${targetZone}`, 500);
    }

    const challengeId = fallbackResult.rows[0].id;
    await createDailyChallenge(userId, challengeId);
  } else {
    const challengeId = challengeResult.rows[0].id;
    await createDailyChallenge(userId, challengeId);
  }
}

/**
 * Create a daily challenge entry for the user
 */
async function createDailyChallenge(userId: string, challengeId: string): Promise<void> {
  await query(
    `INSERT INTO daily_challenges (user_id, challenge_id, scheduled_for, status, delivered_at)
     VALUES ($1, $2, CURRENT_DATE, 'pending', NOW())`,
    [userId, challengeId]
  );
}

/**
 * Assign challenges to all active users
 * This should be called by a daily cron job
 */
export async function assignChallengestoAllUsers(): Promise<void> {
  // Get all users who logged in within the last 30 days
  const activeUsers = await query<{ id: string }>(
    `SELECT id FROM users
     WHERE last_login_at > NOW() - INTERVAL '30 days'
        OR created_at > NOW() - INTERVAL '30 days'`
  );

  // Assign challenges to each active user
  for (const user of activeUsers.rows) {
    try {
      await assignDailyChallenge(user.id);
    } catch (error) {
      console.error(`Failed to assign challenge to user ${user.id}:`, error);
      // Continue with other users even if one fails
    }
  }

  console.log(`✅ Assigned challenges to ${activeUsers.rows.length} active users`);
}
