/**
 * Missed Challenge Banner Component
 *
 * Displays compassionate re-engagement messaging after missed challenges.
 * Implements "Never Miss Twice" principle with escalating support.
 *
 * Design Principles:
 * - Compassionate tone (not guilt-based)
 * - Specific, actionable next steps
 * - Preserves total completions display (not just streaks)
 * - Offers optional difficulty adjustment
 * - Respectful autonomy (user can dismiss)
 *
 * Research: /docs/RESEARCH_missed_challenge_recovery.md
 */

'use client';

import React, { useState } from 'react';
import Button from './Button';

interface RecoveryMessage {
  title: string;
  message: string;
  tone: 'gentle' | 'supportive' | 'direct' | 'respectful';
  urgency: 'low' | 'medium' | 'high';
}

interface MissedChallengeBannerProps {
  consecutiveMisses: number;
  totalCompletions: number;
  lastCompletedDate: Date | null;
  recoveryMessage: RecoveryMessage;
  onStartChallenge: () => void;
  onDismiss?: () => void;
  offerEasierChallenge?: boolean;
}

export default function MissedChallengeBanner({
  consecutiveMisses,
  totalCompletions,
  lastCompletedDate,
  recoveryMessage,
  onStartChallenge,
  onDismiss,
  offerEasierChallenge = false,
}: MissedChallengeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || consecutiveMisses === 0) {
    return null;
  }

  const getBannerColor = () => {
    switch (recoveryMessage.urgency) {
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          icon: 'text-blue-600',
        };
      case 'medium':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          icon: 'text-amber-600',
        };
      case 'high':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-900',
          icon: 'text-orange-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-900',
          icon: 'text-gray-600',
        };
    }
  };

  const colors = getBannerColor();

  const getIcon = () => {
    if (consecutiveMisses === 1) {
      return (
        <svg className={`w-6 h-6 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (consecutiveMisses === 2) {
      return (
        <svg className={`w-6 h-6 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    } else {
      return (
        <svg className={`w-6 h-6 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`mb-6 p-5 rounded-lg border-2 ${colors.bg} ${colors.border} shadow-sm`}>
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>
            {recoveryMessage.title}
          </h3>

          {/* Message */}
          <p className={`text-base ${colors.text} mb-3 leading-relaxed`}>
            {recoveryMessage.message}
          </p>

          {/* Stats Reminder */}
          <div className="flex items-center space-x-6 mb-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Streak:</span>{' '}
              <span className={colors.text}>0 days (reset)</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Completions:</span>{' '}
              <span className="text-green-600 font-semibold">{totalCompletions}</span>
            </div>
            {lastCompletedDate && (
              <div>
                <span className="font-medium text-gray-700">Last completed:</span>{' '}
                <span className={colors.text}>
                  {new Date(lastCompletedDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Optional: Easier Challenge Note */}
          {offerEasierChallenge && consecutiveMisses >= 2 && (
            <div className="p-3 bg-white/50 rounded border border-gray-200 mb-4">
              <p className="text-sm text-gray-700">
                💡 <strong>Tip:</strong> We&apos;ve adjusted today&apos;s challenge to be a bit easier.
                Getting back in is more important than intensity.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onStartChallenge}
              variant="primary"
              className="sm:w-auto"
            >
              {consecutiveMisses === 1 ? 'Start Today&apos;s Challenge' : 'Restart Today'}
            </Button>

            {onDismiss && (
              <Button
                onClick={handleDismiss}
                variant="secondary"
                className="sm:w-auto"
              >
                Remind Me Later
              </Button>
            )}
          </div>
        </div>

        {/* Dismiss X (top right) */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* "Never Miss Twice" Principle Highlight (Day 2 only) */}
      {consecutiveMisses === 2 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 italic">
            <strong>Never Miss Twice:</strong> Missing once is life. Missing twice starts a new habit
            of not doing the behavior. Today breaks the pattern.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * USAGE EXAMPLE:
 *
 * ```tsx
 * import MissedChallengeBanner from '@/components/MissedChallengeBanner';
 *
 * // In Dashboard component
 * {missedStats.consecutiveMisses > 0 && (
 *   <MissedChallengeBanner
 *     consecutiveMisses={missedStats.consecutiveMisses}
 *     totalCompletions={userStats.totalCompletions}
 *     lastCompletedDate={missedStats.lastCompletedDate}
 *     recoveryMessage={getRecoveryMessage(missedStats.consecutiveMisses)}
 *     onStartChallenge={() => router.push('/challenge/today')}
 *     onDismiss={() => setDismissed(true)}
 *     offerEasierChallenge={shouldOfferComebackChallenge(missedStats)}
 *   />
 * )}
 * ```
 */
