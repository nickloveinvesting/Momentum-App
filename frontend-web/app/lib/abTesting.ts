/**
 * A/B Testing Infrastructure
 *
 * Lightweight A/B testing system for landing page optimization.
 * Tracks variant assignment and conversion events.
 *
 * Research: /docs/RESEARCH_landing_page_validation.md
 */

export interface ABTest {
  id: string;
  name: string;
  variants: {
    control: ABVariant;
    treatment: ABVariant;
  };
  enabled: boolean;
  sampleRate: number; // 0-1 (1 = 100% of users)
}

export interface ABVariant {
  id: string;
  label: string;
  value: string;
}

export interface ABTestAssignment {
  userId: string;
  testId: string;
  variant: 'control' | 'treatment';
  assignedAt: Date;
}

/**
 * Active A/B Tests Configuration
 */
export const AB_TESTS: Record<string, ABTest> = {
  landingHeadline: {
    id: 'landing_headline_v1',
    name: 'Landing Page Headline Test',
    variants: {
      control: {
        id: 'headline_current',
        label: 'Current (Direct)',
        value: "We know exactly what you're avoiding.",
      },
      treatment: {
        id: 'headline_action',
        label: 'Action-Oriented',
        value: 'Stop avoiding. Start expanding.',
      },
    },
    enabled: true,
    sampleRate: 1.0, // Test 100% of visitors
  },

  landingCTA: {
    id: 'landing_cta_v1',
    name: 'Call-to-Action Button Text',
    variants: {
      control: {
        id: 'cta_benefit',
        label: 'Benefit-Focused',
        value: 'Start Expanding Today',
      },
      treatment: {
        id: 'cta_action',
        label: 'Action-Focused',
        value: 'Take Your First Challenge',
      },
    },
    enabled: true,
    sampleRate: 1.0,
  },

  landingSubheadline: {
    id: 'landing_subheadline_v1',
    name: 'Subheadline Test',
    variants: {
      control: {
        id: 'sub_problem',
        label: 'Problem-Focused',
        value: 'Your comfort zone is shrinking. Every day you avoid something, your range gets smaller.',
      },
      treatment: {
        id: 'sub_solution',
        label: 'Solution-Focused',
        value: 'Daily micro-challenges that expand your comfort zone. One small action at a time.',
      },
    },
    enabled: false, // Start with 2 tests, add this later
    sampleRate: 0.5,
  },
};

/**
 * Get user's variant assignment for a test
 * Uses deterministic hashing for consistent assignment
 */
export function getVariant(userId: string, testId: string): 'control' | 'treatment' {
  const test = Object.values(AB_TESTS).find((t) => t.id === testId);

  if (!test || !test.enabled) {
    return 'control'; // Default to control if test disabled
  }

  // Check sample rate first
  const sampleHash = hashString(`${userId}_${testId}_sample`);
  if (sampleHash > test.sampleRate) {
    return 'control'; // User not in test sample
  }

  // Deterministic 50/50 split based on user ID + test ID
  const hash = hashString(`${userId}_${testId}`);
  return hash < 0.5 ? 'control' : 'treatment';
}

/**
 * Simple hash function for deterministic assignment
 * Returns value between 0 and 1
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483648; // Normalize to 0-1
}

/**
 * Get all active variants for a user
 */
export function getAllVariants(userId: string): Record<string, string> {
  const variants: Record<string, string> = {};

  Object.entries(AB_TESTS).forEach(([key, test]) => {
    if (test.enabled) {
      const variant = getVariant(userId, test.id);
      variants[key] = test.variants[variant].value;
    } else {
      // Use control by default
      variants[key] = test.variants.control.value;
    }
  });

  return variants;
}

/**
 * Track A/B test assignment
 */
export async function trackAssignment(
  userId: string,
  testId: string,
  variant: 'control' | 'treatment'
): Promise<void> {
  await fetch('/api/analytics/ab-assignment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      testId,
      variant,
      timestamp: Date.now(),
    }),
  });
}

/**
 * Track conversion event
 */
export async function trackConversion(
  userId: string,
  eventType: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await fetch('/api/analytics/conversion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      eventType,
      metadata,
      timestamp: Date.now(),
    }),
  });
}

/**
 * USAGE EXAMPLE (Landing Page):
 *
 * ```tsx
 * import { getAllVariants, trackAssignment, trackConversion } from '@/lib/abTesting';
 *
 * export default function LandingPage() {
 *   const [userId] = useState(() => crypto.randomUUID());
 *   const variants = getAllVariants(userId);
 *
 *   useEffect(() => {
 *     // Track page view with variants
 *     Object.keys(AB_TESTS).forEach((key) => {
 *       const test = AB_TESTS[key];
 *       const variant = getVariant(userId, test.id);
 *       trackAssignment(userId, test.id, variant);
 *     });
 *   }, [userId]);
 *
 *   const handleCTAClick = () => {
 *     trackConversion(userId, 'cta_click', {
 *       headline: variants.landingHeadline,
 *       cta: variants.landingCTA
 *     });
 *     router.push('/register');
 *   };
 *
 *   return (
 *     <div>
 *       <h1>{variants.landingHeadline}</h1>
 *       <button onClick={handleCTAClick}>{variants.landingCTA}</button>
 *     </div>
 *   );
 * }
 * ```
 */
