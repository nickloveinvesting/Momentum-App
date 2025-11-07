/**
 * Analytics API Routes
 *
 * Handles event tracking and A/B test assignment tracking.
 * Integrates with PostHog for analytics (can be swapped for other providers).
 *
 * Research: /docs/RESEARCH_analytics_strategy.md
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/database';
import { validate } from '../middleware/validator';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/analytics/events
 * Track analytics event
 */
router.post('/events',
  [
    body('eventType').isString().notEmpty().withMessage('Event type is required'),
    body('userId').optional().isString(),
    body('anonymousId').optional().isString(),
    body('properties').optional().isObject(),
    body('timestamp').isInt().withMessage('Timestamp is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { eventType, userId, properties, timestamp } = req.body;

    // Store event in database
    await query(
      `INSERT INTO analytics_events (user_id, event, properties, created_at)
       VALUES ($1, $2, $3, to_timestamp($4 / 1000))`,
      [userId || null, eventType, JSON.stringify(properties || {}), timestamp]
    );

    // TODO: Forward to PostHog or other analytics service
    // if (process.env.POSTHOG_API_KEY) {
    //   await posthog.capture({
    //     distinctId: userId || anonymousId,
    //     event: eventType,
    //     properties,
    //   });
    // }

    res.status(200).json({ success: true });
  })
);

/**
 * POST /api/analytics/ab-assignment
 * Track A/B test variant assignment
 */
router.post('/ab-assignment',
  [
    body('userId').isString().notEmpty().withMessage('User ID is required'),
    body('testId').isString().notEmpty().withMessage('Test ID is required'),
    body('variant').isIn(['control', 'treatment']).withMessage('Variant must be control or treatment'),
    body('timestamp').isInt().withMessage('Timestamp is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { userId, testId, variant, timestamp } = req.body;

    // Store A/B test assignment
    await query(
      `INSERT INTO analytics_events (user_id, event, properties, created_at)
       VALUES ($1, 'ab_test_assignment', $2, to_timestamp($3 / 1000))`,
      [userId, JSON.stringify({ testId, variant }), timestamp]
    );

    res.status(200).json({ success: true });
  })
);

/**
 * POST /api/analytics/conversion
 * Track conversion event (CTA clicks, registrations, etc.)
 */
router.post('/conversion',
  [
    body('userId').isString().notEmpty().withMessage('User ID is required'),
    body('eventType').isString().notEmpty().withMessage('Event type is required'),
    body('metadata').optional().isObject(),
    body('timestamp').isInt().withMessage('Timestamp is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { userId, eventType, metadata, timestamp } = req.body;

    // Store conversion event
    await query(
      `INSERT INTO analytics_events (user_id, event, properties, created_at)
       VALUES ($1, $2, $3, to_timestamp($4 / 1000))`,
      [userId, eventType, JSON.stringify(metadata || {}), timestamp]
    );

    res.status(200).json({ success: true });
  })
);

export default router;

/**
 * USAGE IN EXPRESS APP:
 *
 * ```typescript
 * import analyticsRoutes from './routes/analytics';
 * app.use('/api/analytics', analyticsRoutes);
 * ```
 *
 * INTEGRATION WITH POSTHOG:
 *
 * ```typescript
 * import { PostHog } from 'posthog-node';
 *
 * const posthog = new PostHog(
 *   process.env.POSTHOG_API_KEY!,
 *   { host: 'https://app.posthog.com' }
 * );
 *
 * // In event handler:
 * posthog.capture({
 *   distinctId: userId,
 *   event: eventType,
 *   properties,
 * });
 * ```
 */
