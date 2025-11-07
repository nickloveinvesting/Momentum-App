/**
 * Assessment Questions for Avoidance Profile
 *
 * This module contains 23 assessment questions:
 * - 5 questions per avoidance zone (Social, Physical, Professional, Emotional)
 * - 3 questions for intensity preference and change style
 *
 * Behavioral Science Foundation:
 * These questions are designed to identify avoidance patterns based on:
 * 1. Frequency of avoidance behaviors (how often)
 * 2. Recency of avoidance (when did it last happen)
 * 3. Intensity of avoidance response (how much does it impact you)
 * 4. Awareness of avoidance triggers (what situations trigger it)
 *
 * The questions use multiple formats (scale, frequency, recency, binary) to
 * reduce response bias and increase accuracy of the avoidance profile.
 */

import { AssessmentQuestion, AvoidanceZone } from '@momentum/shared';

/**
 * Generate all 23 assessment questions
 * @returns Array of assessment questions
 */
export function generateAssessment(): AssessmentQuestion[] {
  return [
    // ========================================================================
    // SOCIAL AVOIDANCE QUESTIONS (5)
    // ========================================================================
    {
      id: 'social_01',
      category: 'social' as AvoidanceZone,
      question:
        "In the past month, how often have you avoided starting a conversation with someone you don't know well?",
      type: 'frequency',
      options: [
        'Never (0)',
        'Rarely (1-2 times)',
        'Sometimes (3-5 times)',
        'Often (6-10 times)',
        'Very Often (11+ times)',
      ],
    },
    {
      id: 'social_02',
      category: 'social' as AvoidanceZone,
      question:
        "When was the last time you reached out to reconnect with someone you haven't talked to in a while?",
      type: 'recency',
      options: [
        'Within the past week',
        '1-2 weeks ago',
        '3-4 weeks ago',
        '1-3 months ago',
        'More than 3 months ago',
      ],
    },
    {
      id: 'social_03',
      category: 'social' as AvoidanceZone,
      question:
        "On a scale of 0-10, how uncomfortable do you feel attending social events where you don't know most people?",
      type: 'scale',
      options: undefined, // Scale questions are answered with 0-10 number
    },
    {
      id: 'social_04',
      category: 'social' as AvoidanceZone,
      question:
        "How often do you decline social invitations because you're worried about feeling awkward or judged?",
      type: 'frequency',
      options: [
        'Never (0)',
        'Rarely (1-2 times/month)',
        'Sometimes (3-5 times/month)',
        'Often (6-10 times/month)',
        'Very Often (11+ times/month)',
      ],
    },
    {
      id: 'social_05',
      category: 'social' as AvoidanceZone,
      question:
        'Do you actively avoid phone calls or video calls, preferring text-based communication instead?',
      type: 'binary',
      options: ['Yes', 'No'],
    },

    // ========================================================================
    // PHYSICAL AVOIDANCE QUESTIONS (5)
    // ========================================================================
    {
      id: 'physical_01',
      category: 'physical' as AvoidanceZone,
      question:
        'In the past month, how often have you avoided physical activities that push you out of your comfort zone (exercise, sports, outdoor adventures)?',
      type: 'frequency',
      options: [
        'Never (0)',
        'Rarely (1-2 times)',
        'Sometimes (3-5 times)',
        'Often (6-10 times)',
        'Very Often (11+ times)',
      ],
    },
    {
      id: 'physical_02',
      category: 'physical' as AvoidanceZone,
      question:
        'When was the last time you tried a new physical activity or pushed yourself physically?',
      type: 'recency',
      options: [
        'Within the past week',
        '1-2 weeks ago',
        '3-4 weeks ago',
        '1-3 months ago',
        'More than 3 months ago',
      ],
    },
    {
      id: 'physical_03',
      category: 'physical' as AvoidanceZone,
      question:
        'On a scale of 0-10, how much do you avoid situations that require physical effort or discomfort?',
      type: 'scale',
      options: undefined,
    },
    {
      id: 'physical_04',
      category: 'physical' as AvoidanceZone,
      question:
        'How often do you make excuses to avoid physical activities you know would be good for you?',
      type: 'frequency',
      options: [
        'Never (0)',
        'Rarely (1-2 times/week)',
        'Sometimes (3-4 times/week)',
        'Often (5-6 times/week)',
        'Daily (7+ times/week)',
      ],
    },
    {
      id: 'physical_05',
      category: 'physical' as AvoidanceZone,
      question:
        'Do you avoid looking at yourself in mirrors or photos because of discomfort with your physical appearance?',
      type: 'binary',
      options: ['Yes', 'No'],
    },

    // ========================================================================
    // PROFESSIONAL AVOIDANCE QUESTIONS (5)
    // ========================================================================
    {
      id: 'professional_01',
      category: 'professional' as AvoidanceZone,
      question:
        'In the past month, how often have you avoided asking for feedback, help, or opportunities at work/school?',
      type: 'frequency',
      options: [
        'Never (0)',
        'Rarely (1-2 times)',
        'Sometimes (3-5 times)',
        'Often (6-10 times)',
        'Very Often (11+ times)',
      ],
    },
    {
      id: 'professional_02',
      category: 'professional' as AvoidanceZone,
      question:
        'When was the last time you took on a project or responsibility that felt challenging or risky?',
      type: 'recency',
      options: [
        'Within the past week',
        '1-2 weeks ago',
        '3-4 weeks ago',
        '1-3 months ago',
        'More than 3 months ago',
      ],
    },
    {
      id: 'professional_03',
      category: 'professional' as AvoidanceZone,
      question:
        'On a scale of 0-10, how much anxiety do you feel about speaking up in meetings, sharing your ideas, or advocating for yourself?',
      type: 'scale',
      options: undefined,
    },
    {
      id: 'professional_04',
      category: 'professional' as AvoidanceZone,
      question:
        'How often do you procrastinate on important professional tasks that feel difficult or intimidating?',
      type: 'frequency',
      options: [
        'Never (0)',
        'Rarely (1-2 times/month)',
        'Sometimes (3-5 times/month)',
        'Often (6-10 times/month)',
        'Very Often (11+ times/month)',
      ],
    },
    {
      id: 'professional_05',
      category: 'professional' as AvoidanceZone,
      question:
        'Do you avoid networking or professional development opportunities because they feel uncomfortable?',
      type: 'binary',
      options: ['Yes', 'No'],
    },

    // ========================================================================
    // EMOTIONAL AVOIDANCE QUESTIONS (5)
    // ========================================================================
    {
      id: 'emotional_01',
      category: 'emotional' as AvoidanceZone,
      question:
        'In the past month, how often have you avoided thinking about or dealing with difficult emotions?',
      type: 'frequency',
      options: [
        'Never (0)',
        'Rarely (1-2 times)',
        'Sometimes (3-5 times)',
        'Often (6-10 times)',
        'Very Often (11+ times)',
      ],
    },
    {
      id: 'emotional_02',
      category: 'emotional' as AvoidanceZone,
      question:
        "When was the last time you had an honest, vulnerable conversation about how you're really feeling?",
      type: 'recency',
      options: [
        'Within the past week',
        '1-2 weeks ago',
        '3-4 weeks ago',
        '1-3 months ago',
        'More than 3 months ago',
      ],
    },
    {
      id: 'emotional_03',
      category: 'emotional' as AvoidanceZone,
      question:
        'On a scale of 0-10, how much do you use distractions (social media, TV, work, substances) to avoid feeling your emotions?',
      type: 'scale',
      options: undefined,
    },
    {
      id: 'emotional_04',
      category: 'emotional' as AvoidanceZone,
      question:
        'How often do you avoid situations where you might cry, feel angry, or show strong emotions?',
      type: 'frequency',
      options: [
        'Never (0)',
        'Rarely (1-2 times/month)',
        'Sometimes (3-5 times/month)',
        'Often (6-10 times/month)',
        'Very Often (11+ times/month)',
      ],
    },
    {
      id: 'emotional_05',
      category: 'emotional' as AvoidanceZone,
      question:
        'Do you avoid therapy, journaling, or other practices that would require you to examine your emotions closely?',
      type: 'binary',
      options: ['Yes', 'No'],
    },

    // ========================================================================
    // INTENSITY PREFERENCE QUESTIONS (3)
    // These determine time preference and change style
    // ========================================================================
    {
      id: 'intensity_01',
      category: 'social' as AvoidanceZone, // Using social as placeholder, not zone-specific
      question:
        'How much time can you realistically commit to a daily challenge?',
      type: 'frequency',
      options: [
        '5 minutes (I prefer very small steps)',
        '10 minutes (I can do moderate steps)',
        "15 minutes (I'm ready for bigger challenges)",
      ],
    },
    {
      id: 'intensity_02',
      category: 'social' as AvoidanceZone, // Using social as placeholder, not zone-specific
      question:
        'When it comes to personal growth, which approach feels right to you?',
      type: 'frequency',
      options: [
        'Gradual - I prefer tiny, incremental changes that feel safe',
        'Moderate - I want steady progress with some stretching',
        "Aggressive - I'm ready to push hard and embrace discomfort",
      ],
    },
    {
      id: 'intensity_03',
      category: 'social' as AvoidanceZone, // Using social as placeholder, not zone-specific
      question:
        'How do you typically respond when facing something uncomfortable?',
      type: 'frequency',
      options: [
        'I need to ease into it slowly with lots of support',
        'I can handle moderate discomfort with clear guidance',
        'I thrive on challenge and want to dive in',
      ],
    },
  ];
}

/**
 * Helper function to get questions for a specific zone
 * @param zone The avoidance zone
 * @returns Questions for that zone
 */
export function getQuestionsByZone(zone: AvoidanceZone): AssessmentQuestion[] {
  return generateAssessment().filter(
    q => q.category === zone && !q.id.startsWith('intensity_')
  );
}

/**
 * Helper function to get intensity preference questions
 * @returns Intensity/preference questions
 */
export function getIntensityQuestions(): AssessmentQuestion[] {
  return generateAssessment().filter(q => q.id.startsWith('intensity_'));
}

/**
 * Calculate the numeric value from a question response
 * This maps response options to a 0-10 scale for scoring
 *
 * @param question The assessment question
 * @param answer The user's answer
 * @returns Numeric score (0-10)
 */
export function mapAnswerToScore(
  question: AssessmentQuestion,
  answer: string | number
): number {
  // If answer is already a number (scale questions), return it
  if (typeof answer === 'number') {
    return Math.min(10, Math.max(0, answer));
  }

  // For frequency and recency questions, map option index to score
  if (question.options) {
    const index = question.options.indexOf(answer);
    if (index === -1) return 0;

    // Map to 0-10 scale (5 options -> 0, 2.5, 5, 7.5, 10)
    return (index / (question.options.length - 1)) * 10;
  }

  // For binary questions
  if (question.type === 'binary') {
    return answer === 'Yes' ? 10 : 0;
  }

  return 0;
}
