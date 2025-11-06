/**
 * Identity Reinforcement Messaging Service
 *
 * Generates identity-based messages for post-completion reinforcement.
 * Based on research from Duolingo, Strava, Calm, and Peloton.
 *
 * Key Principles:
 * - Identity-first language drives long-term behavior change
 * - Use "you're becoming" early (Days 1-7), shift to "you are" after 5-7 actions
 * - Process-based praise ("you chose to") beats person-based ("you're talented")
 * - Specific, falsifiable statements build trust
 * - Avoid hollow praise and overjustification
 *
 * Research: /docs/RESEARCH_identity_reinforcement.md
 */

export interface IdentityMessage {
  primary: string;      // Main identity statement
  secondary?: string;   // Optional supporting message
  tone: 'encouraging' | 'validating' | 'celebrating' | 'building';
}

/**
 * Generate identity reinforcement message based on zone and user progress
 */
export function generateIdentityMessage(
  zone: 'social' | 'physical' | 'professional' | 'emotional',
  completionCount: number,
  currentStreak: number
): IdentityMessage {
  // Determine user stage
  const isEarly = completionCount <= 4;
  const isEstablishing = completionCount >= 5 && completionCount <= 10;
  const isConsistent = completionCount > 10;

  // Select message bank based on zone
  const messageBank = MESSAGE_BANKS[zone];

  if (isEarly) {
    // Days 1-4: "You're becoming" language
    return pickRandom(messageBank.becoming);
  } else if (isEstablishing) {
    // Days 5-10: Pattern recognition
    return pickRandom(messageBank.pattern);
  } else {
    // 10+: Identity established
    return pickRandom(messageBank.established);
  }
}

/**
 * Generate streak milestone message
 */
export function generateStreakMessage(streak: number): IdentityMessage {
  if (streak === 7) {
    return {
      primary: "7 days. You're proving you're someone who shows up.",
      secondary: "Consistency is building your new identity.",
      tone: 'celebrating',
    };
  } else if (streak === 14) {
    return {
      primary: "Two weeks of expansion. This is who you are now.",
      secondary: "You've moved past the novelty phase—this is real change.",
      tone: 'validating',
    };
  } else if (streak === 30) {
    return {
      primary: "30 days. The person avoiding discomfort? That's not you anymore.",
      secondary: "You've rewired how you respond to challenge.",
      tone: 'celebrating',
    };
  } else if (streak === 100) {
    return {
      primary: "100 days of choosing growth over comfort. Extraordinary.",
      secondary: "You're not just someone who does hard things. You're someone who seeks them out.",
      tone: 'celebrating',
    };
  } else if (streak % 10 === 0) {
    return {
      primary: `${streak} days of facing discomfort. You're rewriting your story.`,
      tone: 'validating',
    };
  } else {
    return {
      primary: `Day ${streak}. Another proof point that you choose growth.`,
      tone: 'encouraging',
    };
  }
}

/**
 * Generate comeback message after breaking streak
 */
export function generateComebackMessage(): IdentityMessage {
  const messages: IdentityMessage[] = [
    {
      primary: "Consistent people start again. That's what you're doing.",
      secondary: "One break doesn't erase your progress.",
      tone: 'encouraging',
    },
    {
      primary: "You're back. That's what matters.",
      secondary: "The pattern you're building is resilience, not perfection.",
      tone: 'validating',
    },
    {
      primary: "This is what growth looks like: showing up after a stumble.",
      secondary: "Your identity isn't defined by never missing—it's defined by always returning.",
      tone: 'building',
    },
  ];

  return pickRandom(messages);
}

/**
 * Message banks by zone
 */
const MESSAGE_BANKS = {
  social: {
    becoming: [
      {
        primary: "You're becoming someone who initiates connection.",
        secondary: "Social anxiety doesn't define your actions anymore.",
        tone: 'building' as const,
      },
      {
        primary: "You chose discomfort over avoidance today. That's identity shift.",
        secondary: "This is how people become socially brave—one action at a time.",
        tone: 'encouraging' as const,
      },
      {
        primary: "Social risk taken. Identity updated.",
        secondary: "You're proving you're willing to be seen.",
        tone: 'validating' as const,
      },
    ],
    pattern: [
      {
        primary: "You've faced social discomfort 5+ times. This is a pattern now.",
        secondary: "You're not someone who occasionally does hard things—you're someone who consistently does.",
        tone: 'validating' as const,
      },
      {
        primary: "Social challenges don't scare you like they used to.",
        secondary: "You're building evidence that connection is worth the discomfort.",
        tone: 'building' as const,
      },
      {
        primary: "You keep choosing to show up socially. That's who you are.",
        tone: 'validating' as const,
      },
    ],
    established: [
      {
        primary: "You're someone who faces social discomfort. The data proves it.",
        secondary: "This isn't who you're trying to be—it's who you are.",
        tone: 'celebrating' as const,
      },
      {
        primary: "Social anxiety might still show up, but it doesn't stop you anymore.",
        secondary: "You've redefined your relationship with social risk.",
        tone: 'validating' as const,
      },
      {
        primary: "You initiate. You engage. You show up. This is your identity now.",
        tone: 'celebrating' as const,
      },
    ],
  },

  physical: {
    becoming: [
      {
        primary: "You're becoming someone who honors their body.",
        secondary: "Physical discomfort is temporary. Growth is permanent.",
        tone: 'building' as const,
      },
      {
        primary: "Your body proved you're willing to be uncomfortable.",
        secondary: "This is how physical courage builds—one challenge at a time.",
        tone: 'encouraging' as const,
      },
      {
        primary: "You chose physical challenge over comfort. Identity shift confirmed.",
        tone: 'validating' as const,
      },
    ],
    pattern: [
      {
        primary: "You keep showing up for physical challenges. This is a pattern.",
        secondary: "You're building evidence that you don't avoid physical discomfort.",
        tone: 'validating' as const,
      },
      {
        primary: "Your body is learning: discomfort doesn't mean danger.",
        secondary: "You're retraining your relationship with physical sensation.",
        tone: 'building' as const,
      },
      {
        primary: "Physical challenges don't intimidate you like they used to.",
        tone: 'validating' as const,
      },
    ],
    established: [
      {
        primary: "You're someone who chooses physical challenge. The evidence is clear.",
        secondary: "This isn't aspiration—this is who you are now.",
        tone: 'celebrating' as const,
      },
      {
        primary: "Physical discomfort shows up, but it doesn't stop you.",
        secondary: "You've redefined your physical limits.",
        tone: 'validating' as const,
      },
      {
        primary: "You honor your body by challenging it. This is your identity.",
        tone: 'celebrating' as const,
      },
    ],
  },

  professional: {
    becoming: [
      {
        primary: "You're becoming someone who takes professional risk.",
        secondary: "Career growth requires visibility. You're choosing it.",
        tone: 'building' as const,
      },
      {
        primary: "You spoke up professionally. That's leadership.",
        secondary: "This is how people build career momentum—by being willing to be seen.",
        tone: 'encouraging' as const,
      },
      {
        primary: "Professional risk taken. Identity updated.",
        tone: 'validating' as const,
      },
    ],
    pattern: [
      {
        primary: "You keep taking professional risks. This is a pattern now.",
        secondary: "You're building a reputation: someone who contributes, not just observes.",
        tone: 'validating' as const,
      },
      {
        primary: "Your voice matters professionally, and you're proving it repeatedly.",
        secondary: "This is career-changing behavior.",
        tone: 'building' as const,
      },
      {
        primary: "Professional challenges don't silence you anymore.",
        tone: 'validating' as const,
      },
    ],
    established: [
      {
        primary: "You're someone who takes professional risks. Your track record proves it.",
        secondary: "This is leadership behavior—consistently showing up with ideas and initiative.",
        tone: 'celebrating' as const,
      },
      {
        primary: "Fear of judgment might show up, but it doesn't stop your contributions.",
        secondary: "You've redefined your professional identity.",
        tone: 'validating' as const,
      },
      {
        primary: "You speak. You propose. You challenge. This is who you are professionally.",
        tone: 'celebrating' as const,
      },
    ],
  },

  emotional: {
    becoming: [
      {
        primary: "You're becoming someone who sits with difficult emotions.",
        secondary: "Emotional avoidance isn't your default anymore.",
        tone: 'building' as const,
      },
      {
        primary: "You faced emotional discomfort without running. That's growth.",
        secondary: "This is how emotional resilience builds—moment by moment.",
        tone: 'encouraging' as const,
      },
      {
        primary: "You made space for hard emotions. Identity shift confirmed.",
        tone: 'validating' as const,
      },
    ],
    pattern: [
      {
        primary: "You keep choosing to feel instead of avoid. This is a pattern.",
        secondary: "You're building evidence that emotions don't break you.",
        tone: 'validating' as const,
      },
      {
        primary: "Difficult emotions show up, and you're learning to stay.",
        secondary: "This is emotional courage.",
        tone: 'building' as const,
      },
      {
        primary: "Emotional challenges don't overwhelm you like they used to.",
        tone: 'validating' as const,
      },
    ],
    established: [
      {
        primary: "You're someone who faces emotional discomfort. The pattern is clear.",
        secondary: "You don't run from grief, shame, or fear anymore—you turn toward it.",
        tone: 'celebrating' as const,
      },
      {
        primary: "Painful emotions might still hurt, but they don't control you.",
        secondary: "You've redefined your relationship with feeling.",
        tone: 'validating' as const,
      },
      {
        primary: "You feel. You process. You grow. This is your identity now.",
        tone: 'celebrating' as const,
      },
    ],
  },
};

/**
 * Helper: Pick random item from array
 */
function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Get zone-appropriate emoji/icon
 */
export function getZoneIcon(zone: string): string {
  const icons = {
    social: '👥',
    physical: '💪',
    professional: '💼',
    emotional: '❤️',
  };
  return icons[zone as keyof typeof icons] || '✨';
}

/**
 * USAGE EXAMPLE:
 *
 * ```typescript
 * import { generateIdentityMessage, generateStreakMessage } from '@/services/identityMessaging';
 *
 * // After challenge completion
 * const message = generateIdentityMessage('social', 3, 3);
 * console.log(message.primary);
 * // => "You're becoming someone who initiates connection."
 *
 * // On streak milestone
 * const streakMsg = generateStreakMessage(7);
 * console.log(streakMsg.primary);
 * // => "7 days. You're proving you're someone who shows up."
 * ```
 */
