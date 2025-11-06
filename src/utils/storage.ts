import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, CompletedChallenge, DailyChallenge } from '../types';
import { format } from 'date-fns';

const KEYS = {
  USER_PROGRESS: '@momentum/user_progress',
  DAILY_CHALLENGE: '@momentum/daily_challenge',
  COMPLETED_CHALLENGES: '@momentum/completed_challenges',
};

// User Progress
export const getUserProgress = async (): Promise<UserProgress> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROGRESS);
    if (data) {
      const progress = JSON.parse(data);
      // Convert date strings back to Date objects
      progress.completedChallenges = progress.completedChallenges.map((cc: CompletedChallenge) => ({
        ...cc,
        completedAt: new Date(cc.completedAt),
      }));
      progress.achievements = progress.achievements.map((a: any) => ({
        ...a,
        unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
      }));
      return progress;
    }
    // Return default progress
    return {
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      completedChallenges: [],
      achievements: [],
      level: 1,
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
};

export const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.USER_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
};

// Daily Challenge
export const getDailyChallenge = async (): Promise<DailyChallenge | null> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.DAILY_CHALLENGE);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error getting daily challenge:', error);
    throw error;
  }
};

export const saveDailyChallenge = async (dailyChallenge: DailyChallenge): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.DAILY_CHALLENGE, JSON.stringify(dailyChallenge));
  } catch (error) {
    console.error('Error saving daily challenge:', error);
    throw error;
  }
};

// Helper to check if we need a new daily challenge
export const needsNewDailyChallenge = async (): Promise<boolean> => {
  const dailyChallenge = await getDailyChallenge();
  if (!dailyChallenge) return true;

  const today = format(new Date(), 'yyyy-MM-dd');
  return dailyChallenge.date !== today;
};

// Clear all data (for testing)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};
