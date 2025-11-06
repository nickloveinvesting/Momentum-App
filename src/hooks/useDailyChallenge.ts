import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { DailyChallenge } from '../types';
import {
  getDailyChallenge,
  saveDailyChallenge,
  needsNewDailyChallenge,
} from '../utils/storage';
import { getRandomChallenge } from '../data/challenges';

export const useDailyChallenge = () => {
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const loadOrCreateDailyChallenge = useCallback(async () => {
    try {
      const needsNew = await needsNewDailyChallenge();

      if (needsNew) {
        // Create new daily challenge
        const today = format(new Date(), 'yyyy-MM-dd');
        const challenge = getRandomChallenge();
        const newDailyChallenge: DailyChallenge = {
          date: today,
          challenge,
          completed: false,
        };

        await saveDailyChallenge(newDailyChallenge);
        setDailyChallenge(newDailyChallenge);
      } else {
        // Load existing challenge
        const existing = await getDailyChallenge();
        setDailyChallenge(existing);
      }
    } catch (error) {
      console.error('Error loading daily challenge:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrCreateDailyChallenge();
  }, [loadOrCreateDailyChallenge]);

  const markChallengeComplete = useCallback(async () => {
    if (!dailyChallenge) return;

    const updated: DailyChallenge = {
      ...dailyChallenge,
      completed: true,
    };

    await saveDailyChallenge(updated);
    setDailyChallenge(updated);
  }, [dailyChallenge]);

  return {
    dailyChallenge,
    loading,
    markChallengeComplete,
    refreshChallenge: loadOrCreateDailyChallenge,
  };
};
