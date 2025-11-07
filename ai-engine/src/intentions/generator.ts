/**
 * Implementation Intention Generator
 *
 * This module generates "When X, then Y" implementation intentions for challenges.
 *
 * Behavioral Science Foundation:
 * Implementation intentions are one of the most powerful behavior change tools.
 * Research by Peter Gollwitzer shows they increase success rates by 2-3x.
 *
 * The "When-Then" format:
 * - WHEN: A specific trigger/cue (time, place, feeling, event)
 * - THEN: The specific action to take (the challenge)
 *
 * Key Principles:
 * 1. Specificity: The more specific, the better
 * 2. Contextual: Match user's routine and environment
 * 3. Realistic: Trigger should be likely to occur
 * 4. Immediate: Link trigger to action without delay
 *
 * Examples:
 * - "When I finish my morning coffee, then I'll text one friend I haven't spoken to in a month"
 * - "When I sit down at my desk, then I'll do 10 pushups"
 * - "When I feel anxious, then I'll write down what I'm feeling for 2 minutes"
 */

import {
  Challenge,
  User,
  ImplementationIntention,
  AvoidanceZone,
} from '@momentum/shared';

/**
 * Generate a personalized implementation intention for a challenge
 *
 * This creates a "When X, then Y" trigger customized to:
 * - The specific challenge
 * - User's timezone and likely routine
 * - The avoidance zone being addressed
 *
 * @param challenge The challenge to create intention for
 * @param user User information (for timezone, context)
 * @param preferredTime Optional time of day ('morning' | 'afternoon' | 'evening')
 * @returns Implementation intention
 */
export function generateImplementationIntention(
  challenge: Challenge,
  user: User,
  preferredTime?: 'morning' | 'afternoon' | 'evening'
): ImplementationIntention {
  // If challenge already has a stored implementation intention, personalize it
  if (challenge.implementationIntention) {
    return personalizeExistingIntention(
      challenge.implementationIntention,
      user,
      preferredTime
    );
  }

  // Otherwise, generate a new one based on the challenge
  return generateNewIntention(challenge, user, preferredTime);
}

/**
 * Personalize an existing implementation intention
 *
 * Takes a generic intention and makes it more specific to the user.
 *
 * @param intention Existing intention
 * @param user User information
 * @param preferredTime Time of day preference
 * @returns Personalized intention
 */
function personalizeExistingIntention(
  intention: ImplementationIntention,
  user: User,
  preferredTime?: 'morning' | 'afternoon' | 'evening'
): ImplementationIntention {
  // For now, return the existing intention
  // Future enhancement: Replace placeholders like {{time}} or {{user_name}}
  return {
    trigger: intention.trigger,
    action: intention.action,
  };
}

/**
 * Generate a new implementation intention from scratch
 *
 * Creates both the trigger and action based on challenge characteristics.
 *
 * @param challenge The challenge
 * @param user User information
 * @param preferredTime Time of day preference
 * @returns New implementation intention
 */
function generateNewIntention(
  challenge: Challenge,
  user: User,
  preferredTime?: 'morning' | 'afternoon' | 'evening'
): ImplementationIntention {
  // Generate trigger based on zone and time preference
  const trigger = generateTrigger(challenge.zone, preferredTime);

  // Action is the challenge description (simplified)
  const action = simplifyAction(challenge.description);

  return { trigger, action };
}

/**
 * Generate a contextual trigger based on zone and time
 *
 * Different zones benefit from different types of triggers:
 * - Social: Routine moments, transition times
 * - Physical: Morning energy, midday breaks
 * - Professional: Work starts, before meetings
 * - Emotional: Quiet moments, reflection times
 *
 * @param zone Avoidance zone
 * @param preferredTime Time of day
 * @returns Trigger phrase
 */
function generateTrigger(
  zone: AvoidanceZone,
  preferredTime?: 'morning' | 'afternoon' | 'evening'
): string {
  const timeOfDay = preferredTime || 'morning'; // Default to morning

  const triggerTemplates: Record<AvoidanceZone, Record<string, string[]>> = {
    social: {
      morning: [
        'When I finish my morning coffee',
        'When I check my phone in the morning',
        'When I finish breakfast',
        'When I get ready for the day',
      ],
      afternoon: [
        'When I take my lunch break',
        'When I finish a work task',
        'When I have a free moment in the afternoon',
        'When I step outside for fresh air',
      ],
      evening: [
        'When I finish dinner',
        'When I wind down for the evening',
        'When I check social media',
        'When I have free time tonight',
      ],
    },
    physical: {
      morning: [
        'When I wake up',
        'When I brush my teeth',
        'When I make my morning coffee',
        'When I get out of bed',
      ],
      afternoon: [
        'When I take a break from work',
        'When I feel low energy in the afternoon',
        'When I finish lunch',
        'When I notice tension in my body',
      ],
      evening: [
        'When I get home',
        'When I change into comfortable clothes',
        'When I finish work for the day',
        'When I prepare for bed',
      ],
    },
    professional: {
      morning: [
        'When I sit down at my desk',
        'When I open my work computer',
        'When I review my to-do list',
        'When I start my workday',
      ],
      afternoon: [
        'When I check my calendar',
        'When I take a coffee break',
        'When I finish a meeting',
        'When I feel stuck on a task',
      ],
      evening: [
        'When I review my day',
        'When I plan for tomorrow',
        'When I close my laptop',
        'When I reflect on work',
      ],
    },
    emotional: {
      morning: [
        'When I have a quiet moment in the morning',
        "When I notice how I'm feeling",
        'When I take my first deep breath of the day',
        'When I journal in the morning',
      ],
      afternoon: [
        'When I feel stressed',
        'When I notice tension building',
        'When I take a mindful pause',
        'When I step away from screens',
      ],
      evening: [
        'When I unwind for the night',
        'When I reflect on my day',
        'When I feel emotions surfacing',
        'When I have quiet time alone',
      ],
    },
  };

  const options = triggerTemplates[zone][timeOfDay];
  return selectRandom(options);
}

/**
 * Simplify the challenge description into a clear action
 *
 * Removes extra context and focuses on the core action.
 *
 * @param description Full challenge description
 * @returns Simplified action phrase
 */
function simplifyAction(description: string): string {
  // Remove common prefixes
  let simplified = description
    .replace(/^(Try to |Attempt to |Please |Today, )/i, '')
    .trim();

  // Capitalize first letter
  simplified = simplified.charAt(0).toUpperCase() + simplified.slice(1);

  // Ensure it ends with punctuation
  if (!simplified.match(/[.!?]$/)) {
    simplified += '.';
  }

  return simplified;
}

/**
 * Generate multiple intention options for user to choose from
 *
 * Giving users choice increases commitment and personalization.
 *
 * @param challenge The challenge
 * @param user User information
 * @returns Array of 3 implementation intention options
 */
export function generateIntentionOptions(
  challenge: Challenge,
  user: User
): ImplementationIntention[] {
  const timeOptions: ('morning' | 'afternoon' | 'evening')[] = [
    'morning',
    'afternoon',
    'evening',
  ];

  return timeOptions.map(time =>
    generateImplementationIntention(challenge, user, time)
  );
}

/**
 * Customize trigger based on user habits (future enhancement)
 *
 * This could analyze user's completion patterns to suggest better triggers.
 * For example, if user always completes challenges at 7am, suggest morning triggers.
 *
 * @param user User information
 * @param completionHistory Past challenge completions
 * @returns Recommended time of day
 */
export function recommendTriggerTime(
  user: User,
  completionHistory?: Array<{ completedAt: Date }>
): 'morning' | 'afternoon' | 'evening' {
  // Placeholder: analyze completion patterns
  // For now, default to afternoon (most flexible)
  if (!completionHistory || completionHistory.length === 0) {
    return 'afternoon';
  }

  // Count completions by time of day
  const timeCount = {
    morning: 0,
    afternoon: 0,
    evening: 0,
  };

  completionHistory.forEach(completion => {
    const hour = new Date(completion.completedAt).getHours();
    if (hour >= 5 && hour < 12) {
      timeCount.morning++;
    } else if (hour >= 12 && hour < 18) {
      timeCount.afternoon++;
    } else {
      timeCount.evening++;
    }
  });

  // Return most common time
  const mostCommon = Object.entries(timeCount).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
  return mostCommon as 'morning' | 'afternoon' | 'evening';
}

/**
 * Validate implementation intention quality
 *
 * Checks if an intention follows best practices:
 * - Specific enough
 * - Action-oriented
 * - Realistic
 *
 * @param intention The intention to validate
 * @returns Validation result with suggestions
 */
export function validateIntention(intention: ImplementationIntention): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check trigger specificity
  if (intention.trigger.length < 10) {
    issues.push('Trigger is too vague');
    suggestions.push('Add more specific context (time, place, feeling)');
  }

  if (!intention.trigger.toLowerCase().startsWith('when')) {
    issues.push('Trigger should start with "When"');
    suggestions.push('Rephrase as: "When [specific situation], then..."');
  }

  // Check action clarity
  if (intention.action.length < 10) {
    issues.push('Action is too vague');
    suggestions.push("Be more specific about what you'll do");
  }

  // Check for time-bound elements
  const hasTimeElement = /\d+\s*(min|minute|hour|second)/i.test(
    intention.action
  );
  if (!hasTimeElement) {
    suggestions.push(
      'Consider adding a time constraint (e.g., "for 5 minutes")'
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Helper: Select random item from array
 */
function selectRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a reminder notification for the implementation intention
 *
 * Creates notification text to remind user of their when-then plan.
 *
 * @param intention The implementation intention
 * @param challengeTitle The challenge title
 * @returns Notification text
 */
export function generateIntentionReminder(
  intention: ImplementationIntention,
  challengeTitle: string
): string {
  return `Remember: ${intention.trigger}, then ${intention.action}\n\n"${challengeTitle}"`;
}
