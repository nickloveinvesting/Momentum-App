import { useState, useEffect, useCallback } from 'react';
import { UserProgress, CompletedChallenge, Challenge } from '../types';
import { getUserProgress, saveUserProgress } from '../utils/storage';
import {
  calculateLevel,
  calculateStreak,
  checkNewAchievements,
} from '../utils/gamification';

export const useProgress = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    try {
      const data = await getUserProgress();
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const completeChallenge = useCallback(
    async (challenge: Challenge, notes?: string, rating?: number) => {
      if (!progress) return;

      const completedChallenge: CompletedChallenge = {
        challengeId: challenge.id,
        completedAt: new Date(),
        notes,
        rating,
      };

      const updatedCompletedChallenges = [
        ...progress.completedChallenges,
        completedChallenge,
      ];

      const newTotalPoints = progress.totalPoints + challenge.points;
      const streaks = calculateStreak(updatedCompletedChallenges);

      const updatedProgress: UserProgress = {
        ...progress,
        totalPoints: newTotalPoints,
        currentStreak: streaks.current,
        longestStreak: Math.max(streaks.longest, progress.longestStreak),
        completedChallenges: updatedCompletedChallenges,
        level: calculateLevel(newTotalPoints),
      };

      // Check for new achievements
      const newAchievements = checkNewAchievements(
        updatedProgress,
        updatedCompletedChallenges
      );

      if (newAchievements.length > 0) {
        updatedProgress.achievements = [
          ...updatedProgress.achievements,
          ...newAchievements,
        ];
      }

      await saveUserProgress(updatedProgress);
      setProgress(updatedProgress);

      return { newAchievements, updatedProgress };
    },
    [progress]
  );

  return {
    progress,
    loading,
    completeChallenge,
    refreshProgress: loadProgress,
  };
};
