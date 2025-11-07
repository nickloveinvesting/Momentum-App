/**
 * SUDS Tracking Service
 * Subjective Units of Distress Scale (0-100)
 *
 * Research: /docs/RESEARCH_assessment_design.md
 *
 * Purpose:
 * - Track anxiety before/after challenges
 * - Show users that exposure therapy is working
 * - Validate product effectiveness
 * - Provide insights for difficulty calibration
 */

import { query } from '../config/database';
import { AvoidanceZone } from '@momentum/shared';

export interface SudsRating {
  id: string;
  dailyChallengeId: string;
  userId: string;
  preSuds: number | null; // 0-100
  postSuds: number | null; // 0-100
  sudsDelta: number | null; // pre - post (positive = improvement)
  createdAt: Date;
}

/**
 * Record pre-challenge SUDS rating
 */
export async function recordPreSuds(
  dailyChallengeId: string,
  userId: string,
  sudsRating: number
): Promise<void> {
  if (sudsRating < 0 || sudsRating > 100) {
    throw new Error('SUDS rating must be between 0 and 100');
  }

  await query(
    `INSERT INTO suds_ratings (daily_challenge_id, user_id, pre_suds)
     VALUES ($1, $2, $3)
     ON CONFLICT (daily_challenge_id)
     DO UPDATE SET pre_suds = $3`,
    [dailyChallengeId, userId, sudsRating]
  );
}

/**
 * Record post-challenge SUDS rating and calculate delta
 */
export async function recordPostSuds(
  dailyChallengeId: string,
  userId: string,
  sudsRating: number
): Promise<number> {
  if (sudsRating < 0 || sudsRating > 100) {
    throw new Error('SUDS rating must be between 0 and 100');
  }

  // Get pre-SUDS
  const preResult = await query<{ pre_suds: number }>(
    `SELECT pre_suds FROM suds_ratings WHERE daily_challenge_id = $1`,
    [dailyChallengeId]
  );

  const preSuds = preResult.rows[0]?.pre_suds;

  if (preSuds === null || preSuds === undefined) {
    throw new Error('Pre-SUDS rating not found. Must record pre-SUDS before post-SUDS.');
  }

  const sudsDelta = preSuds - sudsRating; // Positive = anxiety reduced

  await query(
    `UPDATE suds_ratings
     SET post_suds = $1, suds_delta = $2
     WHERE daily_challenge_id = $3`,
    [sudsRating, sudsDelta, dailyChallengeId]
  );

  return sudsDelta;
}

/**
 * Get SUDS rating for a challenge
 */
export async function getSudsRating(dailyChallengeId: string): Promise<SudsRating | null> {
  const result = await query<any>(
    `SELECT * FROM suds_ratings WHERE daily_challenge_id = $1`,
    [dailyChallengeId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    dailyChallengeId: row.daily_challenge_id,
    userId: row.user_id,
    preSuds: row.pre_suds,
    postSuds: row.post_suds,
    sudsDelta: row.suds_delta,
    createdAt: row.created_at,
  };
}

/**
 * Get average SUDS reduction for user (proof of progress)
 */
export async function getAverageSudsReduction(userId: string): Promise<{
  overall: number;
  byZone: Record<AvoidanceZone, number>;
  last7Days: number;
  last30Days: number;
}> {
  // Overall average
  const overallResult = await query<{ avg: string }>(
    `SELECT AVG(suds_delta) as avg
     FROM suds_ratings
     WHERE user_id = $1 AND suds_delta IS NOT NULL`,
    [userId]
  );

  const overall = parseFloat(overallResult.rows[0]?.avg || '0');

  // By zone
  const zoneResult = await query<{ zone: AvoidanceZone; avg: string }>(
    `SELECT c.zone, AVG(sr.suds_delta) as avg
     FROM suds_ratings sr
     JOIN daily_challenges dc ON sr.daily_challenge_id = dc.id
     JOIN challenges c ON dc.challenge_id = c.id
     WHERE sr.user_id = $1 AND sr.suds_delta IS NOT NULL
     GROUP BY c.zone`,
    [userId]
  );

  const byZone: Partial<Record<AvoidanceZone, number>> = {};
  for (const row of zoneResult.rows) {
    byZone[row.zone] = parseFloat(row.avg);
  }

  // Last 7 days
  const last7Result = await query<{ avg: string }>(
    `SELECT AVG(suds_delta) as avg
     FROM suds_ratings
     WHERE user_id = $1
       AND suds_delta IS NOT NULL
       AND created_at >= NOW() - INTERVAL '7 days'`,
    [userId]
  );

  const last7Days = parseFloat(last7Result.rows[0]?.avg || '0');

  // Last 30 days
  const last30Result = await query<{ avg: string }>(
    `SELECT AVG(suds_delta) as avg
     FROM suds_ratings
     WHERE user_id = $1
       AND suds_delta IS NOT NULL
       AND created_at >= NOW() - INTERVAL '30 days'`,
    [userId]
  );

  const last30Days = parseFloat(last30Result.rows[0]?.avg || '0');

  return {
    overall,
    byZone: byZone as Record<AvoidanceZone, number>,
    last7Days,
    last30Days,
  };
}

/**
 * Get SUDS insights for user dashboard
 */
export async function getSudsInsights(userId: string): Promise<{
  message: string;
  improvement: number;
  color: 'green' | 'yellow' | 'gray';
}> {
  const stats = await getAverageSudsReduction(userId);

  if (stats.last7Days === 0) {
    return {
      message: 'Track your anxiety before and after challenges to see your progress!',
      improvement: 0,
      color: 'gray',
    };
  }

  const improvement = Math.round(stats.last7Days);

  if (improvement > 20) {
    return {
      message: `Your anxiety dropped ${improvement} points on average this week. That's real progress! 🎉`,
      improvement,
      color: 'green',
    };
  } else if (improvement > 10) {
    return {
      message: `You're reducing anxiety by ${improvement} points per challenge. Keep going! ✨`,
      improvement,
      color: 'green',
    };
  } else if (improvement > 0) {
    return {
      message: `Small wins add up: ${improvement} point anxiety reduction per challenge.`,
      improvement,
      color: 'yellow',
    };
  } else {
    return {
      message: 'Anxiety might spike initially - that means you\'re at the edge of growth! 💪',
      improvement,
      color: 'yellow',
    };
  }
}

/**
 * Get SUDS trend data for visualization
 */
export async function getSudsTrend(userId: string, days: number = 30): Promise<{
  date: string;
  avgPreSuds: number;
  avgPostSuds: number;
  avgDelta: number;
}[]> {
  const result = await query<any>(
    `SELECT
      DATE(sr.created_at) as date,
      AVG(sr.pre_suds) as avg_pre,
      AVG(sr.post_suds) as avg_post,
      AVG(sr.suds_delta) as avg_delta
     FROM suds_ratings sr
     WHERE sr.user_id = $1
       AND sr.created_at >= CURRENT_DATE - INTERVAL '${days} days'
       AND sr.suds_delta IS NOT NULL
     GROUP BY DATE(sr.created_at)
     ORDER BY date ASC`,
    [userId]
  );

  return result.rows.map(row => ({
    date: row.date,
    avgPreSuds: parseFloat(row.avg_pre || '0'),
    avgPostSuds: parseFloat(row.avg_post || '0'),
    avgDelta: parseFloat(row.avg_delta || '0'),
  }));
}
