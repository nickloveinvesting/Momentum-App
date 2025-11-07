/**
 * KPI Dashboard API Routes
 *
 * Provides real-time KPIs for product-market fit validation.
 * Based on research showing Day 7 and Day 30 retention are strongest predictors.
 *
 * Research: /docs/RESEARCH_analytics_strategy.md
 *
 * Target Benchmarks:
 * - Day 1 retention: >40% (industry avg: 20%)
 * - Day 7 retention: >25% (industry avg: 8.5%, signals PMF)
 * - Day 30 retention: >15% (industry avg: 4%)
 * - Challenge completion: >55%
 */

import { Router } from 'express';
import { query } from '../config/database';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Type definitions for query results
interface RateResult {
  rate: number;
}

interface CountResult {
  count: string | number;
}

interface AvgStreakResult {
  avg_streak: number;
}

/**
 * GET /api/kpi/overview
 * Core metrics for product-market fit validation
 */
router.get('/overview', authenticate, asyncHandler(async (_req, res) => {
  const kpis = await calculateCoreKPIs();
  res.json(kpis);
}));

/**
 * GET /api/kpi/retention-curve
 * Daily retention curve data for visualization
 */
router.get('/retention-curve', authenticate, asyncHandler(async (_req, res) => {
  const curve = await calculateRetentionCurve();
  res.json(curve);
}));

/**
 * GET /api/kpi/funnel
 * Conversion funnel metrics
 */
router.get('/funnel', authenticate, asyncHandler(async (_req, res) => {
  const funnel = await calculateFunnel();
  res.json(funnel);
}));

/**
 * Calculate core KPIs
 */
async function calculateCoreKPIs() {
  // Day 1 Retention
  const day1Retention = await query<RateResult>(`
    SELECT
      COUNT(DISTINCT CASE WHEN days_active >= 1 THEN user_id END)::float /
      NULLIF(COUNT(DISTINCT user_id), 0) * 100 as rate
    FROM (
      SELECT
        u.id as user_id,
        EXTRACT(DAY FROM MAX(dc.completed_at) - u.created_at) as days_active
      FROM users u
      LEFT JOIN daily_challenges dc ON u.id = dc.user_id AND dc.status = 'completed'
      WHERE u.created_at > NOW() - INTERVAL '30 days'
      GROUP BY u.id
    ) as user_activity
  `);

  // Day 7 Retention
  const day7Retention = await query<RateResult>(`
    SELECT
      COUNT(DISTINCT CASE WHEN days_active >= 7 THEN user_id END)::float /
      NULLIF(COUNT(DISTINCT CASE WHEN EXTRACT(DAY FROM NOW() - created_at) >= 7 THEN user_id END), 0) * 100 as rate
    FROM (
      SELECT
        u.id as user_id,
        u.created_at,
        MAX(CASE WHEN dc.status = 'completed' THEN dc.completed_at END) as last_completion
      FROM users u
      LEFT JOIN daily_challenges dc ON u.id = dc.user_id
      WHERE u.created_at > NOW() - INTERVAL '30 days'
      GROUP BY u.id, u.created_at
    ) as user_activity
    CROSS JOIN LATERAL (
      SELECT EXTRACT(DAY FROM last_completion - created_at) as days_active
    ) as days
  `);

  // Day 30 Retention
  const day30Retention = await query<RateResult>(`
    SELECT
      COUNT(DISTINCT CASE WHEN days_active >= 30 THEN user_id END)::float /
      NULLIF(COUNT(DISTINCT CASE WHEN EXTRACT(DAY FROM NOW() - created_at) >= 30 THEN user_id END), 0) * 100 as rate
    FROM (
      SELECT
        u.id as user_id,
        u.created_at,
        MAX(CASE WHEN dc.status = 'completed' THEN dc.completed_at END) as last_completion
      FROM users u
      LEFT JOIN daily_challenges dc ON u.id = dc.user_id
      WHERE u.created_at > NOW() - INTERVAL '60 days'
      GROUP BY u.id, u.created_at
    ) as user_activity
    CROSS JOIN LATERAL (
      SELECT EXTRACT(DAY FROM last_completion - created_at) as days_active
    ) as days
  `);

  // Challenge Completion Rate
  const completionRate = await query<RateResult>(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'completed')::float /
      NULLIF(COUNT(*), 0) * 100 as rate
    FROM daily_challenges
    WHERE scheduled_for > NOW() - INTERVAL '7 days'
  `);

  // Average Streak
  const avgStreak = await query<AvgStreakResult>(`
    SELECT AVG(current_streak) as avg_streak
    FROM streaks
    WHERE current_streak > 0
  `);

  // Weekly Active Users (WAU) - North Star Metric
  const wau = await query<CountResult>(`
    SELECT COUNT(DISTINCT user_id) as count
    FROM daily_challenges
    WHERE status = 'completed'
    AND completed_at > NOW() - INTERVAL '7 days'
  `);

  // Total Users
  const totalUsers = await query<CountResult>(`
    SELECT COUNT(*) as count FROM users
    WHERE created_at > NOW() - INTERVAL '30 days'
  `);

  return {
    retention: {
      day1: Math.round((day1Retention.rows[0]?.rate || 0) * 10) / 10,
      day7: Math.round((day7Retention.rows[0]?.rate || 0) * 10) / 10,
      day30: Math.round((day30Retention.rows[0]?.rate || 0) * 10) / 10,
    },
    engagement: {
      completionRate: Math.round((completionRate.rows[0]?.rate || 0) * 10) / 10,
      avgStreak: Math.round((avgStreak.rows[0]?.avg_streak || 0) * 10) / 10,
      weeklyActiveUsers: parseInt(String(wau.rows[0]?.count || '0')),
    },
    users: {
      total: parseInt(String(totalUsers.rows[0]?.count || '0')),
      newThisWeek: 0, // Simplified for now
    },
    benchmarks: {
      day1Target: 40,
      day7Target: 25,
      day30Target: 15,
      completionTarget: 55,
    },
  };
}

/**
 * Calculate retention curve for visualization
 */
async function calculateRetentionCurve() {
  const result = await query(`
    WITH user_cohorts AS (
      SELECT
        u.id as user_id,
        DATE_TRUNC('day', u.created_at) as cohort_date,
        DATE_TRUNC('day', dc.completed_at) as activity_date,
        EXTRACT(DAY FROM dc.completed_at - u.created_at) as days_since_signup
      FROM users u
      LEFT JOIN daily_challenges dc ON u.id = dc.user_id AND dc.status = 'completed'
      WHERE u.created_at > NOW() - INTERVAL '60 days'
    )
    SELECT
      days_since_signup as day,
      COUNT(DISTINCT user_id)::float /
      (SELECT COUNT(DISTINCT user_id) FROM user_cohorts WHERE days_since_signup = 0) * 100 as retention_rate
    FROM user_cohorts
    WHERE days_since_signup IS NOT NULL AND days_since_signup <= 30
    GROUP BY days_since_signup
    ORDER BY days_since_signup
  `);

  return result.rows;
}

/**
 * Calculate conversion funnel
 */
async function calculateFunnel() {
  const landingPageViews = await query(`
    SELECT COUNT(*) as count
    FROM analytics_events
    WHERE event = 'landing_page_view'
    AND created_at > NOW() - INTERVAL '7 days'
  `);

  const ctaClicks = await query(`
    SELECT COUNT(*) as count
    FROM analytics_events
    WHERE event = 'cta_clicked'
    AND created_at > NOW() - INTERVAL '7 days'
  `);

  const registrations = await query(`
    SELECT COUNT(*) as count
    FROM users
    WHERE created_at > NOW() - INTERVAL '7 days'
  `);

  const assessmentCompletions = await query(`
    SELECT COUNT(DISTINCT user_id) as count
    FROM avoidance_profiles
    WHERE created_at > NOW() - INTERVAL '7 days'
  `);

  const firstChallengeCompletions = await query(`
    SELECT COUNT(DISTINCT user_id) as count
    FROM daily_challenges
    WHERE status = 'completed'
    AND completed_at > NOW() - INTERVAL '7 days'
    AND user_id IN (
      SELECT id FROM users WHERE created_at > NOW() - INTERVAL '7 days'
    )
  `);

  const views = parseInt(landingPageViews.rows[0]?.count || '0');
  const clicks = parseInt(ctaClicks.rows[0]?.count || '0');
  const regs = parseInt(registrations.rows[0]?.count || '0');
  const assessments = parseInt(assessmentCompletions.rows[0]?.count || '0');
  const firstChallenges = parseInt(firstChallengeCompletions.rows[0]?.count || '0');

  return {
    steps: [
      { name: 'Landing Page Views', count: views, percentage: 100 },
      { name: 'CTA Clicks', count: clicks, percentage: views > 0 ? (clicks / views) * 100 : 0 },
      { name: 'Registrations', count: regs, percentage: clicks > 0 ? (regs / clicks) * 100 : 0 },
      { name: 'Assessment Complete', count: assessments, percentage: regs > 0 ? (assessments / regs) * 100 : 0 },
      { name: 'First Challenge Done', count: firstChallenges, percentage: assessments > 0 ? (firstChallenges / assessments) * 100 : 0 },
    ],
    overallConversion: views > 0 ? (firstChallenges / views) * 100 : 0,
  };
}

export default router;

/**
 * USAGE IN EXPRESS APP:
 *
 * ```typescript
 * import kpiDashboardRoutes from './routes/kpiDashboard';
 * app.use('/api/kpi', kpiDashboardRoutes);
 * ```
 *
 * FRONTEND USAGE:
 *
 * ```typescript
 * const response = await fetch('/api/kpi/overview');
 * const kpis = await response.json();
 *
 * console.log(`Day 7 Retention: ${kpis.retention.day7}%`);
 * console.log(`Target: ${kpis.benchmarks.day7Target}%`);
 * ```
 */
