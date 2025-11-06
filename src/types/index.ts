export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export enum ChallengeCategory {
  SOCIAL = 'social',
  PHYSICAL = 'physical',
  MENTAL = 'mental',
  CREATIVE = 'creative',
  PROFESSIONAL = 'professional',
  WELLNESS = 'wellness',
}

export interface CompletedChallenge {
  challengeId: string;
  completedAt: Date;
  notes?: string;
  rating?: number;
}

export interface UserProgress {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  completedChallenges: CompletedChallenge[];
  achievements: Achievement[];
  level: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  requirement: number;
  category: 'streak' | 'points' | 'challenges' | 'category';
}

export interface DailyChallenge {
  date: string;
  challenge: Challenge;
  completed: boolean;
}
