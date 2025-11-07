/**
 * ChallengeCard Component
 * Displays a challenge summary with zone color coding
 */

import React from 'react';
import Link from 'next/link';
import type { Challenge, DailyChallenge } from '@momentum/shared';
import { cn, getZoneColor, getZoneLabel, getDifficultyLabel, getDifficultyColor } from '@/lib/utils';

interface ChallengeCardProps {
  dailyChallenge: DailyChallenge;
  challenge: Challenge;
  onClick?: () => void;
  className?: string;
}

export default function ChallengeCard({
  dailyChallenge,
  challenge,
  onClick,
  className,
}: ChallengeCardProps) {
  const isCompleted = dailyChallenge.status === 'completed';
  const isPending = dailyChallenge.status === 'pending';
  const isAccepted = dailyChallenge.status === 'accepted';

  const cardClassName = cn(
    'block w-full text-left transition-all duration-200',
    'bg-white rounded-xl shadow-md hover:shadow-lg',
    'border-l-4',
    isCompleted && 'opacity-75',
    className
  );

  const cardStyle = {
    borderLeftColor: getZoneColor(challenge.zone).replace('bg-', '#'),
  };

  const cardContent = (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium text-white',
              getZoneColor(challenge.zone)
            )}
          >
            {getZoneLabel(challenge.zone)}
          </span>
          <span className={cn('text-xs font-medium', getDifficultyColor(challenge.difficulty))}>
            {getDifficultyLabel(challenge.difficulty)}
          </span>
        </div>
        {isCompleted && (
          <div className="flex items-center text-green-600">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {challenge.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {challenge.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {challenge.estimatedTime} min
        </div>

        {isPending && (
          <span className="text-sm font-medium text-primary-900">
            View Challenge →
          </span>
        )}
        {isAccepted && (
          <span className="text-sm font-medium text-orange-600">
            In Progress
          </span>
        )}
        {isCompleted && (
          <span className="text-sm font-medium text-green-600">
            Completed
          </span>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        type="button"
        className={cardClassName}
        style={cardStyle}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link
      href={`/challenge/${dailyChallenge.id}`}
      className={cardClassName}
      style={cardStyle}
    >
      {cardContent}
    </Link>
  );
}
