import { format, differenceInDays, parseISO } from 'date-fns';
import { UserProgress, CompletedChallenge, Achievement, ChallengeCategory } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

export const calculateLevel = (points: number): number => {
  // Level up every 100 points
  return Math.floor(points / 100) + 1;
};

export const getPointsForNextLevel = (currentPoints: number): number => {
  const currentLevel = calculateLevel(currentPoints);
  return currentLevel * 100;
};

export const calculateStreak = (completedChallenges: CompletedChallenge[]): { current: number; longest: number } => {
  if (completedChallenges.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Sort by date descending
  const sorted = [...completedChallenges].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const challenge of sorted) {
    const currentDate = new Date(challenge.completedAt);
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    if (!lastDate) {
      // First challenge
      const today = format(new Date(), 'yyyy-MM-dd');
      const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

      if (dateStr === today || dateStr === yesterday) {
        currentStreak = 1;
        tempStreak = 1;
      }
      lastDate = currentDate;
      continue;
    }

    const daysDiff = differenceInDays(lastDate, currentDate);

    if (daysDiff === 0) {
      // Same day, don't increment
      continue;
    } else if (daysDiff === 1) {
      // Consecutive day
      tempStreak++;
      if (currentStreak > 0) {
        currentStreak++;
      }
    } else {
      // Streak broken
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
      currentStreak = 0;
    }

    lastDate = currentDate;
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { current: currentStreak, longest: longestStreak };
};

export const checkNewAchievements = (
  progress: UserProgress,
  completedChallenges: CompletedChallenge[]
): Achievement[] => {
  const newAchievements: Achievement[] = [];
  const unlockedIds = progress.achievements.map(a => a.id);

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.includes(achievement.id)) continue;

    let unlocked = false;

    switch (achievement.category) {
      case 'challenges':
        unlocked = completedChallenges.length >= achievement.requirement;
        break;
      case 'streak':
        unlocked = progress.currentStreak >= achievement.requirement;
        break;
      case 'points':
        unlocked = progress.totalPoints >= achievement.requirement;
        break;
      case 'category':
        // Count challenges in specific category
        const categoryCount = completedChallenges.filter(cc => {
          // This would need challenge data to check category
          // For now, we'll skip category achievements
          return false;
        }).length;
        unlocked = categoryCount >= achievement.requirement;
        break;
    }

    if (unlocked) {
      newAchievements.push({
        ...achievement,
        unlockedAt: new Date(),
      });
    }
  }

  return newAchievements;
};

export const getCategoryColor = (category: ChallengeCategory): string => {
  const colors: Record<ChallengeCategory, string> = {
    [ChallengeCategory.SOCIAL]: '#FF6B6B',
    [ChallengeCategory.PHYSICAL]: '#4ECDC4',
    [ChallengeCategory.MENTAL]: '#95E1D3',
    [ChallengeCategory.CREATIVE]: '#F38181',
    [ChallengeCategory.PROFESSIONAL]: '#AA96DA',
    [ChallengeCategory.WELLNESS]: '#FCBAD3',
  };
  return colors[category];
};

export const getCategoryIcon = (category: ChallengeCategory): string => {
  const icons: Record<ChallengeCategory, string> = {
    [ChallengeCategory.SOCIAL]: '👥',
    [ChallengeCategory.PHYSICAL]: '💪',
    [ChallengeCategory.MENTAL]: '🧠',
    [ChallengeCategory.CREATIVE]: '🎨',
    [ChallengeCategory.PROFESSIONAL]: '💼',
    [ChallengeCategory.WELLNESS]: '🌿',
  };
  return icons[category];
};
