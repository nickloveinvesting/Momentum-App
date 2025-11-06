import { Challenge, ChallengeCategory } from '../types';

export const CHALLENGES: Challenge[] = [
  // Social Challenges
  {
    id: 'social-1',
    title: 'Start a Conversation',
    description: 'Strike up a conversation with a stranger today. It could be at a coffee shop, on public transit, or anywhere you feel comfortable.',
    category: ChallengeCategory.SOCIAL,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'social-2',
    title: 'Give a Genuine Compliment',
    description: 'Compliment three different people today. Make it genuine and specific.',
    category: ChallengeCategory.SOCIAL,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'social-3',
    title: 'Share Your Opinion',
    description: 'In a group setting, share an opinion you\'ve been holding back. Be respectful but authentic.',
    category: ChallengeCategory.SOCIAL,
    difficulty: 'medium',
    points: 20,
  },
  {
    id: 'social-4',
    title: 'Make a Phone Call',
    description: 'Call someone instead of texting. Have a real conversation.',
    category: ChallengeCategory.SOCIAL,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'social-5',
    title: 'Attend a Social Event Alone',
    description: 'Go to a meetup, workshop, or social gathering by yourself.',
    category: ChallengeCategory.SOCIAL,
    difficulty: 'hard',
    points: 30,
  },

  // Physical Challenges
  {
    id: 'physical-1',
    title: 'Try a New Exercise',
    description: 'Do a workout or physical activity you\'ve never tried before.',
    category: ChallengeCategory.PHYSICAL,
    difficulty: 'medium',
    points: 15,
  },
  {
    id: 'physical-2',
    title: 'Take the Stairs',
    description: 'Use stairs instead of elevators/escalators all day.',
    category: ChallengeCategory.PHYSICAL,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'physical-3',
    title: 'Morning Stretch Routine',
    description: 'Do a 15-minute stretching routine first thing in the morning.',
    category: ChallengeCategory.PHYSICAL,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'physical-4',
    title: 'Cold Shower',
    description: 'Take a cold shower for at least 2 minutes.',
    category: ChallengeCategory.PHYSICAL,
    difficulty: 'hard',
    points: 25,
  },
  {
    id: 'physical-5',
    title: 'Walk 10,000 Steps',
    description: 'Walk at least 10,000 steps today.',
    category: ChallengeCategory.PHYSICAL,
    difficulty: 'medium',
    points: 15,
  },

  // Mental Challenges
  {
    id: 'mental-1',
    title: 'Learn Something New',
    description: 'Spend 30 minutes learning about a topic you know nothing about.',
    category: ChallengeCategory.MENTAL,
    difficulty: 'easy',
    points: 15,
  },
  {
    id: 'mental-2',
    title: 'Digital Detox Hour',
    description: 'Go one hour without any screens or digital devices.',
    category: ChallengeCategory.MENTAL,
    difficulty: 'medium',
    points: 20,
  },
  {
    id: 'mental-3',
    title: 'Meditation Session',
    description: 'Meditate for 15 minutes without interruption.',
    category: ChallengeCategory.MENTAL,
    difficulty: 'medium',
    points: 20,
  },
  {
    id: 'mental-4',
    title: 'Read a Book',
    description: 'Read for 30 minutes from a physical book.',
    category: ChallengeCategory.MENTAL,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'mental-5',
    title: 'Journal Your Thoughts',
    description: 'Write in a journal for 20 minutes about your day, feelings, or goals.',
    category: ChallengeCategory.MENTAL,
    difficulty: 'easy',
    points: 10,
  },

  // Creative Challenges
  {
    id: 'creative-1',
    title: 'Create Art',
    description: 'Draw, paint, or create any form of visual art for 30 minutes.',
    category: ChallengeCategory.CREATIVE,
    difficulty: 'medium',
    points: 20,
  },
  {
    id: 'creative-2',
    title: 'Write a Story',
    description: 'Write a short story or poem (at least 200 words).',
    category: ChallengeCategory.CREATIVE,
    difficulty: 'medium',
    points: 20,
  },
  {
    id: 'creative-3',
    title: 'Try a New Recipe',
    description: 'Cook something you\'ve never made before.',
    category: ChallengeCategory.CREATIVE,
    difficulty: 'easy',
    points: 15,
  },
  {
    id: 'creative-4',
    title: 'Take Creative Photos',
    description: 'Take 10 photos with a specific theme or style you haven\'t tried.',
    category: ChallengeCategory.CREATIVE,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'creative-5',
    title: 'Music Creation',
    description: 'Write a song, compose music, or learn to play a new instrument for 30 minutes.',
    category: ChallengeCategory.CREATIVE,
    difficulty: 'hard',
    points: 25,
  },

  // Professional Challenges
  {
    id: 'professional-1',
    title: 'Network with Someone',
    description: 'Reach out to someone in your industry for advice or to build a connection.',
    category: ChallengeCategory.PROFESSIONAL,
    difficulty: 'medium',
    points: 20,
  },
  {
    id: 'professional-2',
    title: 'Learn a New Skill',
    description: 'Take an online course or tutorial for a professional skill.',
    category: ChallengeCategory.PROFESSIONAL,
    difficulty: 'medium',
    points: 20,
  },
  {
    id: 'professional-3',
    title: 'Organize Your Workspace',
    description: 'Completely organize and declutter your work area.',
    category: ChallengeCategory.PROFESSIONAL,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'professional-4',
    title: 'Speak Up in a Meeting',
    description: 'Share an idea or ask a question in a work meeting.',
    category: ChallengeCategory.PROFESSIONAL,
    difficulty: 'medium',
    points: 15,
  },
  {
    id: 'professional-5',
    title: 'Update Your Resume',
    description: 'Update your resume or LinkedIn profile with recent accomplishments.',
    category: ChallengeCategory.PROFESSIONAL,
    difficulty: 'easy',
    points: 10,
  },

  // Wellness Challenges
  {
    id: 'wellness-1',
    title: 'Healthy Meal Prep',
    description: 'Prepare a healthy, balanced meal from scratch.',
    category: ChallengeCategory.WELLNESS,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'wellness-2',
    title: 'Gratitude Practice',
    description: 'Write down 10 things you\'re grateful for today.',
    category: ChallengeCategory.WELLNESS,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'wellness-3',
    title: '8 Hours of Sleep',
    description: 'Get a full 8 hours of quality sleep tonight.',
    category: ChallengeCategory.WELLNESS,
    difficulty: 'medium',
    points: 15,
  },
  {
    id: 'wellness-4',
    title: 'Hydration Goal',
    description: 'Drink at least 8 glasses of water today.',
    category: ChallengeCategory.WELLNESS,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'wellness-5',
    title: 'Self-Care Activity',
    description: 'Spend 30 minutes on a self-care activity (bath, skincare, massage, etc.).',
    category: ChallengeCategory.WELLNESS,
    difficulty: 'easy',
    points: 10,
  },
];

export const getRandomChallenge = (): Challenge => {
  return CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
};

export const getChallengesByCategory = (category: ChallengeCategory): Challenge[] => {
  return CHALLENGES.filter(c => c.category === category);
};

export const getChallengeById = (id: string): Challenge | undefined => {
  return CHALLENGES.find(c => c.id === id);
};
