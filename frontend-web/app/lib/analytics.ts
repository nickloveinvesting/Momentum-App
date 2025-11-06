/**
 * Analytics Event Tracking
 *
 * Lightweight event tracking for KPI monitoring.
 * Designed to work with PostHog (free tier: 1M events/month).
 *
 * Research: /docs/RESEARCH_analytics_strategy.md
 */

export interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  anonymousId?: string;
  properties?: Record<string, any>;
  timestamp: number;
}

/**
 * Core Event Types
 * Keep minimal (5-10 events max for MVP)
 */
export const EVENT_TYPES = {
  // User Lifecycle
  USER_REGISTERED: 'user_registered',
  ASSESSMENT_COMPLETED: 'assessment_completed',

  // Core Engagement
  CHALLENGE_DELIVERED: 'challenge_delivered',
  CHALLENGE_COMPLETED: 'challenge_completed',
  CHALLENGE_SKIPPED: 'challenge_skipped',

  // Retention Indicators
  APP_OPENED: 'app_opened',
  STREAK_MILESTONE: 'streak_milestone', // 7, 14, 30 days

  // Landing Page
  LANDING_PAGE_VIEW: 'landing_page_view',
  CTA_CLICKED: 'cta_clicked',
  EMAIL_COLLECTED: 'email_collected',
} as const;

/**
 * Track event
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        timestamp: event.timestamp || Date.now(),
      }),
    });

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event.eventType, event.properties);
    }
  } catch (error) {
    console.error('Analytics tracking failed:', error);
    // Fail silently - don't block user experience
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, userId?: string): void {
  trackEvent({
    eventType: 'page_view',
    userId,
    properties: {
      page: pageName,
      url: typeof window !== 'undefined' ? window.location.href : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    },
    timestamp: Date.now(),
  });
}

/**
 * Helper functions for common events
 */
export const analytics = {
  // User lifecycle
  userRegistered: (userId: string, properties?: Record<string, any>) =>
    trackEvent({
      eventType: EVENT_TYPES.USER_REGISTERED,
      userId,
      properties,
      timestamp: Date.now(),
    }),

  assessmentCompleted: (
    userId: string,
    scores: { social: number; physical: number; professional: number; emotional: number }
  ) =>
    trackEvent({
      eventType: EVENT_TYPES.ASSESSMENT_COMPLETED,
      userId,
      properties: scores,
      timestamp: Date.now(),
    }),

  // Challenge events
  challengeDelivered: (userId: string, challengeId: string, zone: string, difficulty: string) =>
    trackEvent({
      eventType: EVENT_TYPES.CHALLENGE_DELIVERED,
      userId,
      properties: { challengeId, zone, difficulty },
      timestamp: Date.now(),
    }),

  challengeCompleted: (userId: string, challengeId: string, zone: string, streak: number) =>
    trackEvent({
      eventType: EVENT_TYPES.CHALLENGE_COMPLETED,
      userId,
      properties: { challengeId, zone, streak },
      timestamp: Date.now(),
    }),

  challengeSkipped: (userId: string, challengeId: string, zone: string) =>
    trackEvent({
      eventType: EVENT_TYPES.CHALLENGE_SKIPPED,
      userId,
      properties: { challengeId, zone },
      timestamp: Date.now(),
    }),

  // Retention
  appOpened: (userId: string) =>
    trackEvent({
      eventType: EVENT_TYPES.APP_OPENED,
      userId,
      timestamp: Date.now(),
    }),

  streakMilestone: (userId: string, streak: number) =>
    trackEvent({
      eventType: EVENT_TYPES.STREAK_MILESTONE,
      userId,
      properties: { streak },
      timestamp: Date.now(),
    }),

  // Landing page
  landingPageView: (anonymousId: string, variant: Record<string, any>) =>
    trackEvent({
      eventType: EVENT_TYPES.LANDING_PAGE_VIEW,
      anonymousId,
      properties: { variant },
      timestamp: Date.now(),
    }),

  ctaClicked: (anonymousId: string, ctaText: string) =>
    trackEvent({
      eventType: EVENT_TYPES.CTA_CLICKED,
      anonymousId,
      properties: { ctaText },
      timestamp: Date.now(),
    }),

  emailCollected: (anonymousId: string, email: string) =>
    trackEvent({
      eventType: EVENT_TYPES.EMAIL_COLLECTED,
      anonymousId,
      properties: { email },
      timestamp: Date.now(),
    }),
};

/**
 * USAGE EXAMPLE:
 *
 * ```tsx
 * import { analytics } from '@/lib/analytics';
 *
 * // User registration
 * await registerUser(email, password);
 * analytics.userRegistered(userId, { source: 'landing_page' });
 *
 * // Challenge completion
 * await completeChallenge(challengeId);
 * analytics.challengeCompleted(userId, challengeId, 'social', currentStreak);
 *
 * // App opened
 * useEffect(() => {
 *   analytics.appOpened(userId);
 * }, []);
 * ```
 */
