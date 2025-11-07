/**
 * EvidenceSubmission Component
 * MVP: Text-only evidence submission (20-1000 characters)
 * Photo/voice evidence postponed to Phase 2
 *
 * Research-backed design:
 * - 20-char minimum prevents "Done" responses, requires actual description
 * - 1000-char maximum allows detail without overwhelm
 * - Real-time validation with character counter
 * - Encourages (but doesn't require) evidence submission
 * - Auto-save drafts to prevent loss
 */

'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { DESIGN_TOKENS } from '@momentum/shared/design-tokens';

interface EvidenceSubmissionProps {
  challengeId: string;
  challengeTitle?: string;
  onSubmit: (evidenceText: string) => Promise<void>;
  onSkip?: () => void;
  className?: string;
}

const MIN_CHARS = 20;
const MAX_CHARS = 1000;
const LOCAL_STORAGE_KEY_PREFIX = 'momentum_evidence_draft_';

export default function EvidenceSubmission({
  challengeId,
  challengeTitle,
  onSubmit,
  onSkip,
  className = '',
}: EvidenceSubmissionProps) {
  const [evidenceText, setEvidenceText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // Auto-save drafts to localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + challengeId);
    if (savedDraft) {
      setEvidenceText(savedDraft);
    }
  }, [challengeId]);

  useEffect(() => {
    if (evidenceText.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + challengeId, evidenceText);
    }
  }, [evidenceText, challengeId]);

  const charCount = evidenceText.trim().length;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const isOverLimit = charCount > MAX_CHARS;

  const getCharCountColor = () => {
    if (isOverLimit) return 'text-red-600';
    if (charCount < MIN_CHARS) return 'text-gray-400';
    return 'text-green-600';
  };

  const getCharCountMessage = () => {
    if (charCount === 0) return `Type at least ${MIN_CHARS} characters to submit`;
    if (charCount < MIN_CHARS) return `${MIN_CHARS - charCount} more characters needed`;
    if (isOverLimit) return `${charCount - MAX_CHARS} characters over limit`;
    return `${charCount}/${MAX_CHARS}`;
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setError(charCount < MIN_CHARS
        ? `Please provide more detail (at least ${MIN_CHARS} characters)`
        : `Please keep it under ${MAX_CHARS} characters`
      );
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(evidenceText.trim());
      // Clear draft on successful submission
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + challengeId);
    } catch (err: any) {
      setError(err.message || 'Failed to submit evidence. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (charCount > 0 && !showSkipConfirm) {
      setShowSkipConfirm(true);
      return;
    }

    // Clear draft
    localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + challengeId);
    onSkip?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValid) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Proof of Expansion
        </h2>
        <p className="text-gray-600">
          What happened? How did you approach{challengeTitle ? ` "${challengeTitle}"` : ' this challenge'}?
        </p>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={evidenceText}
          onChange={(e) => {
            setEvidenceText(e.target.value);
            setError('');
            setShowSkipConfirm(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Tell us what you did. How did it feel? What did you learn?&#10;&#10;Example: I approached the cashier and asked about their day. My heart was racing at first, but they smiled warmly and we ended up chatting for 2 minutes about local coffee shops. I realized most people are happy to connect."
          className="w-full min-h-[200px] p-4 text-base border-2 border-gray-300 rounded-lg
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none
                     resize-y transition-colors duration-200
                     placeholder:text-gray-400 placeholder:text-sm
                     disabled:bg-gray-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
          maxLength={MAX_CHARS + 50} // Allow typing a bit over to show error
          autoFocus
        />

        {/* Character Counter */}
        <div className={`absolute bottom-3 right-3 text-sm font-medium ${getCharCountColor()}`}>
          {getCharCountMessage()}
        </div>
      </div>

      {/* Validation Checkmark */}
      {isValid && !isOverLimit && (
        <div className="flex items-center text-green-600 text-sm">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Ready to submit</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-sm text-gray-500 space-y-1">
        <p>💡 <strong>Tip:</strong> Evidence helps habits stick. Take 30 seconds to reflect on what you did.</p>
        <p className="text-xs text-gray-400">Press Cmd/Ctrl + Enter to submit quickly</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          isLoading={isSubmitting}
          variant="primary"
          className="flex-1 min-h-[44px]"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Proof'}
        </Button>

        {onSkip && (
          <Button
            onClick={handleSkip}
            variant="secondary"
            disabled={isSubmitting}
            className="sm:w-auto min-h-[44px]"
          >
            {showSkipConfirm ? 'Confirm Skip' : 'Add Later'}
          </Button>
        )}
      </div>

      {/* Skip Confirmation Message */}
      {showSkipConfirm && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <p className="font-medium">You've written {charCount} characters.</p>
          <p className="mt-1">Evidence boosts retention by 2x. Click "Confirm Skip" to continue without it.</p>
        </div>
      )}

      {/* Optional: Phase 2 Preview */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          Coming soon: Photo & voice evidence (Phase 2)
        </p>
      </div>
    </div>
  );
}

/**
 * USAGE EXAMPLE:
 *
 * ```tsx
 * <EvidenceSubmission
 *   challengeId="uuid-123"
 *   challengeTitle="Start a 2-Minute Conversation"
 *   onSubmit={async (text) => {
 *     await api.completeChallenge(challengeId, { evidenceText: text });
 *   }}
 *   onSkip={() => router.push('/dashboard')}
 * />
 * ```
 */
