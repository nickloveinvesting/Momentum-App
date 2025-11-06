/**
 * Challenge Completion Screen
 *
 * Displays post-completion celebration with identity reinforcement messaging.
 * Shows for 3 seconds, then redirects to dashboard.
 *
 * Research-backed design:
 * - Identity-first language (not generic praise)
 * - Immediate feedback (<100ms critical window)
 * - Visual + verbal + haptic combination
 * - Process-based praise ("you chose to") not person-based
 * - Specific, falsifiable statements
 *
 * Research: /docs/RESEARCH_identity_reinforcement.md
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DESIGN_TOKENS } from '@momentum/shared/design-tokens';

interface Challenge {
  id: string;
  title: string;
  zone: 'social' | 'physical' | 'professional' | 'emotional';
}

interface UserProfile {
  completionCount: number;
  currentStreak: number;
}

interface IdentityMessage {
  primary: string;
  secondary?: string;
  tone: 'encouraging' | 'validating' | 'celebrating' | 'building';
}

interface ChallengeCompletionProps {
  challenge: Challenge;
  userProfile: UserProfile;
  identityMessage: IdentityMessage;
  onComplete?: () => void;
  autoRedirect?: boolean;
  redirectDelay?: number; // milliseconds
}

export default function ChallengeCompletion({
  challenge,
  userProfile,
  identityMessage,
  onComplete,
  autoRedirect = true,
  redirectDelay = 3000,
}: ChallengeCompletionProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animations
  useEffect(() => {
    // Immediate visual feedback
    setTimeout(() => setIsVisible(true), 50);

    // Trigger haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]); // Success pattern
    }
  }, []);

  // Auto-redirect countdown
  useEffect(() => {
    if (!autoRedirect) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (redirectDelay / 100));
      });
    }, 100);

    const timeout = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        router.push('/dashboard');
      }
    }, redirectDelay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [autoRedirect, redirectDelay, onComplete, router]);

  const getZoneColor = () => {
    const colors = {
      social: '#3B82F6',
      physical: '#10B981',
      professional: '#8B5CF6',
      emotional: '#F59E0B',
    };
    return colors[challenge.zone];
  };

  const getZoneIcon = () => {
    const icons = {
      social: '👥',
      physical: '💪',
      professional: '💼',
      emotional: '❤️',
    };
    return icons[challenge.zone];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div
        className={`w-full max-w-2xl transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          {autoRedirect && (
            <div className="h-1 bg-gray-100">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8 sm:p-12 text-center">
            {/* Success Animation */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-success-100 animate-checkmark-pulse">
                <svg
                  className="w-12 h-12 text-success-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Challenge Title */}
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Challenge Complete {getZoneIcon()}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              {challenge.title}
            </h2>

            {/* Identity Reinforcement Message */}
            <div
              className="mb-8 p-6 rounded-xl"
              style={{
                backgroundColor: `${getZoneColor()}10`,
                borderLeft: `4px solid ${getZoneColor()}`,
              }}
            >
              <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 leading-relaxed">
                {identityMessage.primary}
              </p>
              {identityMessage.secondary && (
                <p className="text-base text-gray-600 leading-relaxed">
                  {identityMessage.secondary}
                </p>
              )}
            </div>

            {/* Streak Display */}
            <div className="flex items-center justify-center space-x-8 mb-8">
              {/* Current Streak */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <span className="text-3xl">🔥</span>
                  <span className="text-4xl font-bold text-gray-900">
                    {userProfile.currentStreak}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium">Day Streak</p>
              </div>

              {/* Completion Count */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <span className="text-3xl">✓</span>
                  <span className="text-4xl font-bold text-gray-900">
                    {userProfile.completionCount}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium">Total Completions</p>
              </div>
            </div>

            {/* Call to Action */}
            {!autoRedirect && (
              <button
                onClick={() => onComplete?.() || router.push('/dashboard')}
                className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Back to Dashboard
              </button>
            )}

            {autoRedirect && (
              <p className="text-sm text-gray-400">
                Redirecting to dashboard in {Math.ceil((redirectDelay - (progress * redirectDelay / 100)) / 1000)}s...
              </p>
            )}
          </div>
        </div>

        {/* Mini Range Map Preview (Optional) */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            View your full progress on the dashboard
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes checkmark-pulse {
          0% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-checkmark-pulse {
          animation: checkmark-pulse 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes zone-map-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
          }
        }

        /* Success colors */
        .bg-success-100 {
          background-color: #DCFCE7;
        }
        .text-success-600 {
          color: #16A34A;
        }

        .bg-primary-600 {
          background-color: #0EA5E9;
        }
        .bg-primary-700 {
          background-color: #0284C7;
        }
        .hover\\:bg-primary-700:hover {
          background-color: #0284C7;
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .text-4xl {
            font-size: 2rem;
          }
          .text-2xl {
            font-size: 1.5rem;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-checkmark-pulse {
            animation: none;
          }
          .transition-all {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * USAGE EXAMPLE:
 *
 * ```tsx
 * import ChallengeCompletion from '@/components/ChallengeCompletion';
 *
 * <ChallengeCompletion
 *   challenge={{
 *     id: 'uuid-123',
 *     title: 'Start a 2-Minute Conversation',
 *     zone: 'social'
 *   }}
 *   userProfile={{
 *     completionCount: 8,
 *     currentStreak: 7
 *   }}
 *   identityMessage={{
 *     primary: "You're someone who faces social discomfort. This proves it.",
 *     secondary: "Social anxiety didn't win today. You did.",
 *     tone: 'validating'
 *   }}
 *   autoRedirect={true}
 *   redirectDelay={3000}
 * />
 * ```
 */
