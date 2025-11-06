/**
 * 12-Question Assessment (MVP Version)
 *
 * Reduced from 23 questions to 12 for <2 minute completion time.
 * Based on research showing 10-15 questions is optimal balance.
 *
 * Design Principles:
 * - 3 questions per zone (social, physical, professional, emotional)
 * - Mix of frequency (66%) and recency (25%) + 1 binary (8%)
 * - Behavioral focus (what they DO, not what they ARE)
 * - Specific, falsifiable questions (avoid Barnum effect)
 * - Target completion time: 90-120 seconds
 *
 * Research: /docs/RESEARCH_assessment_design.md
 *
 * Scoring:
 * - Each question contributes to zone score (0-10 scale)
 * - Questions weighted equally within zone
 * - Final scores normalized to identify primary/secondary zones
 */

export interface AssessmentQuestion {
  id: string;
  zone: 'social' | 'physical' | 'professional' | 'emotional';
  question: string;
  type: 'frequency' | 'recency' | 'binary' | 'scale';
  options?: string[];
  scores?: number[];
  min?: number;
  max?: number;
  helpText?: string;
}

/**
 * 12-Question Assessment (3 per zone)
 * Optimized for completion rate and accuracy
 */
export const ASSESSMENT_QUESTIONS_12: AssessmentQuestion[] = [
  // =========================================================================
  // SOCIAL ZONE (3 questions)
  // =========================================================================
  {
    id: 'social_01',
    zone: 'social',
    question: 'In the past month, how often did you initiate a conversation with someone you don\'t know well?',
    type: 'frequency',
    options: ['Never (0 times)', 'Rarely (1-2 times)', 'Sometimes (3-5 times)', 'Often (6+ times)'],
    scores: [10, 6, 3, 0],
    helpText: 'Think about starting conversations at work, events, or in public spaces.',
  },
  {
    id: 'social_02',
    zone: 'social',
    question: 'When in a group conversation, how often do you contribute your thoughts or opinions?',
    type: 'frequency',
    options: ['Almost never', 'Occasionally', 'Regularly', 'Frequently'],
    scores: [10, 7, 3, 0],
    helpText: 'Consider meetings, social gatherings, or group discussions.',
  },
  {
    id: 'social_03',
    zone: 'social',
    question: 'How comfortable are you making a phone call (instead of texting) when coordinating with someone?',
    type: 'scale',
    min: 1,
    max: 10,
    helpText: '1 = Very uncomfortable, 10 = Completely comfortable',
  },

  // =========================================================================
  // PHYSICAL ZONE (3 questions)
  // =========================================================================
  {
    id: 'physical_01',
    zone: 'physical',
    question: 'In the past month, how often did you do something physically uncomfortable by choice (cold shower, hard workout, etc.)?',
    type: 'frequency',
    options: ['Never (0 times)', 'Rarely (1-3 times)', 'Sometimes (4-8 times)', 'Often (9+ times)'],
    scores: [10, 6, 3, 0],
    helpText: 'Think about activities that pushed your physical limits.',
  },
  {
    id: 'physical_02',
    zone: 'physical',
    question: 'When was the last time you exercised to the point of being significantly out of breath?',
    type: 'recency',
    options: ['More than a month ago', '2-4 weeks ago', 'Within the past week', 'Within the past 3 days'],
    scores: [10, 7, 3, 0],
    helpText: 'Significant means breathing hard, not just elevated heart rate.',
  },
  {
    id: 'physical_03',
    zone: 'physical',
    question: 'Rate your willingness to try a new physical activity you\'ve never done before: 1-10',
    type: 'scale',
    min: 1,
    max: 10,
    helpText: '1 = Very unwilling, 10 = Eager to try',
  },

  // =========================================================================
  // PROFESSIONAL ZONE (3 questions)
  // =========================================================================
  {
    id: 'professional_01',
    zone: 'professional',
    question: 'In the past month, how often did you speak up in a meeting or share an idea at work?',
    type: 'frequency',
    options: ['Never (0 times)', 'Rarely (1-2 times)', 'Sometimes (3-5 times)', 'Often (6+ times)'],
    scores: [10, 6, 3, 0],
    helpText: 'Count any contribution, even brief questions or comments.',
  },
  {
    id: 'professional_02',
    zone: 'professional',
    question: 'When you have a different opinion than your manager or team, how often do you voice it?',
    type: 'frequency',
    options: ['Almost never', 'Occasionally', 'Regularly', 'Frequently'],
    scores: [10, 7, 3, 0],
    helpText: 'Think about times when you disagreed but stayed silent vs. spoke up.',
  },
  {
    id: 'professional_03',
    zone: 'professional',
    question: 'How comfortable are you asking for feedback on your work?',
    type: 'scale',
    min: 1,
    max: 10,
    helpText: '1 = Very uncomfortable, 10 = Completely comfortable',
  },

  // =========================================================================
  // EMOTIONAL ZONE (3 questions)
  // =========================================================================
  {
    id: 'emotional_01',
    zone: 'emotional',
    question: 'When you feel a difficult emotion (sadness, fear, anger), how often do you allow yourself to feel it without distracting?',
    type: 'frequency',
    options: ['Almost never', 'Occasionally', 'Regularly', 'Frequently'],
    scores: [10, 7, 3, 0],
    helpText: 'Distracting includes scrolling, eating, watching TV, staying busy.',
  },
  {
    id: 'emotional_02',
    zone: 'emotional',
    question: 'When was the last time you cried or allowed yourself to feel deep sadness?',
    type: 'recency',
    options: ['More than 6 months ago', '1-6 months ago', 'Within the past month', 'Within the past week'],
    scores: [10, 7, 3, 0],
    helpText: 'This measures willingness to feel grief, not frequency of sad events.',
  },
  {
    id: 'emotional_03',
    zone: 'emotional',
    question: 'How comfortable are you sharing your fears or vulnerabilities with someone you trust?',
    type: 'scale',
    min: 1,
    max: 10,
    helpText: '1 = Very uncomfortable, 10 = Completely comfortable',
  },
];

/**
 * Score calculation for 12-question assessment
 */
export function scoreAssessment12(responses: Record<string, any>): {
  social: number;
  physical: number;
  professional: number;
  emotional: number;
  primaryZone: string;
  secondaryZone: string;
} {
  const zoneScores = {
    social: 0,
    physical: 0,
    professional: 0,
    emotional: 0,
  };

  // Score each question
  ASSESSMENT_QUESTIONS_12.forEach((question) => {
    const response = responses[question.id];

    if (question.type === 'frequency' || question.type === 'recency') {
      // Multiple choice with predefined scores
      const selectedIndex = question.options?.indexOf(response);
      if (selectedIndex !== undefined && selectedIndex !== -1 && question.scores) {
        zoneScores[question.zone] += question.scores[selectedIndex];
      }
    } else if (question.type === 'scale') {
      // Scale questions (1-10): Invert so lower comfort = higher avoidance
      const scaleValue = parseInt(response);
      if (!isNaN(scaleValue)) {
        zoneScores[question.zone] += (11 - scaleValue); // 10 becomes 1, 1 becomes 10
      }
    }
  });

  // Normalize scores to 0-10 scale
  // Each zone has 3 questions, max score per question is 10, so max total is 30
  Object.keys(zoneScores).forEach((zone) => {
    zoneScores[zone as keyof typeof zoneScores] = (zoneScores[zone as keyof typeof zoneScores] / 30) * 10;
  });

  // Identify primary and secondary zones
  const sortedZones = Object.entries(zoneScores).sort((a, b) => b[1] - a[1]);

  return {
    social: Math.round(zoneScores.social * 10) / 10,
    physical: Math.round(zoneScores.physical * 10) / 10,
    professional: Math.round(zoneScores.professional * 10) / 10,
    emotional: Math.round(zoneScores.emotional * 10) / 10,
    primaryZone: sortedZones[0][0],
    secondaryZone: sortedZones[1][0],
  };
}

/**
 * Get zone interpretation for results display
 * Avoids Barnum effect with specific, behavioral language
 */
export function getZoneInterpretation(zone: string, score: number): string {
  const interpretations: Record<string, Record<string, string>> = {
    social: {
      high: "You tend to avoid initiating social interactions and speaking up in groups. Social situations feel risky.",
      medium: "You're comfortable in some social situations but hesitate in others, especially with new people.",
      low: "You're comfortable initiating conversations and participating in social situations.",
    },
    physical: {
      high: "You typically avoid physical discomfort and intense exercise. Your body's comfort zone is narrow.",
      medium: "You engage in some physical challenges but often choose comfort over intensity.",
      low: "You regularly push yourself physically and are comfortable with physical discomfort.",
    },
    professional: {
      high: "You avoid speaking up at work and sharing your ideas, especially with authority figures.",
      medium: "You contribute at work sometimes but often hold back your opinions or ideas.",
      low: "You regularly share your ideas and speak up at work, even when it feels risky.",
    },
    emotional: {
      high: "You tend to avoid difficult emotions by staying busy or distracting yourself.",
      medium: "You allow yourself to feel some emotions but avoid the deepest or most painful ones.",
      low: "You're comfortable sitting with difficult emotions without needing to fix or avoid them.",
    },
  };

  const tier = score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low';
  return interpretations[zone][tier];
}

/**
 * USAGE EXAMPLE:
 *
 * ```typescript
 * import { ASSESSMENT_QUESTIONS_12, scoreAssessment12, getZoneInterpretation } from './assessmentQuestions12';
 *
 * // In assessment flow
 * const responses = {
 *   social_01: 'Never (0 times)',
 *   social_02: 'Occasionally',
 *   social_03: 3,
 *   // ... etc
 * };
 *
 * const scores = scoreAssessment12(responses);
 * console.log(scores);
 * // => { social: 7.3, physical: 5.2, professional: 8.1, emotional: 4.7,
 * //      primaryZone: 'professional', secondaryZone: 'social' }
 *
 * const interpretation = getZoneInterpretation('professional', scores.professional);
 * console.log(interpretation);
 * // => "You avoid speaking up at work..."
 * ```
 *
 * Expected Completion Time: 90-120 seconds (research-validated)
 * Completion Rate Target: >90% (research shows 10-15 questions optimal)
 */
