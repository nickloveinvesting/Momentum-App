/**
 * StreakDisplay Component
 * Shows current and longest streak with visual indicators
 */

import React from 'react';
import type { Streak } from '@momentum/shared';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  streak: Streak;
  variant?: 'compact' | 'full';
  className?: string;
}

export default function StreakDisplay({
  streak,
  variant = 'full',
  className,
}: StreakDisplayProps) {
  const isOnFire = streak.currentStreak >= 7;
  const isMilestone = [7, 14, 21, 28, 56, 100].includes(streak.currentStreak);

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center">
          {isOnFire ? (
            <span className="text-2xl" role="img" aria-label="fire">
              🔥
            </span>
          ) : (
            <svg
              className="w-6 h-6 text-orange-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {streak.currentStreak}
          </div>
          <div className="text-xs text-gray-500">day streak</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2',
        isMilestone ? 'border-orange-500' : 'border-orange-200',
        className
      )}
    >
      {/* Current Streak */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-2">
          {isOnFire ? (
            <span className="text-6xl" role="img" aria-label="fire">
              🔥
            </span>
          ) : (
            <svg
              className="w-16 h-16 text-orange-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div className="text-5xl font-bold text-gray-900 mb-1">
          {streak.currentStreak}
        </div>
        <div className="text-lg text-gray-600">
          {streak.currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
        </div>
        {isMilestone && (
          <div className="mt-2 inline-block px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full">
            Milestone Reached!
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 border-t border-orange-200 pt-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {streak.longestStreak}
          </div>
          <div className="text-sm text-gray-600">Longest Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {streak.freezeAvailable && !streak.freezeUsedThisWeek ? (
              <span className="text-blue-600">✓</span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
          <div className="text-sm text-gray-600">Freeze Available</div>
        </div>
      </div>

      {/* Encouragement */}
      {streak.currentStreak > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600 italic">
          {streak.currentStreak < 7 && "Keep going! You're building momentum."}
          {streak.currentStreak >= 7 && streak.currentStreak < 14 && "You're on fire! One week strong."}
          {streak.currentStreak >= 14 && streak.currentStreak < 21 && "Incredible! Two weeks of consistency."}
          {streak.currentStreak >= 21 && "You're unstoppable! This is who you are."}
        </div>
      )}
    </div>
  );
}
