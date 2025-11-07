/**
 * Challenge Detail Page
 * Shows full challenge description, identity frame, and evidence submission
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { challengeAPI } from '@/lib/api';
import type { Challenge, DailyChallenge } from '@momentum/shared';
import { getZoneColor, getZoneLabel, getDifficultyLabel, getZoneBorderColor } from '@/lib/utils';
import Button from '@/app/components/Button';
import EvidenceUpload from '@/app/components/EvidenceUpload';
import { cn } from '@/lib/utils';

export default function ChallengeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const todayChallenge = await challengeAPI.getTodayChallenge();
        if (todayChallenge && todayChallenge.id === params.id) {
          setDailyChallenge(todayChallenge);
          if (todayChallenge.challenge) {
            setChallenge(todayChallenge.challenge);
          }
        }
      } catch (error) {
        console.error('Failed to fetch challenge:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenge();
  }, [params.id]);

  const handleAccept = async () => {
    if (!dailyChallenge) return;
    setIsAccepting(true);

    try {
      await challengeAPI.acceptChallenge(dailyChallenge.id);
      setDailyChallenge({ ...dailyChallenge, status: 'accepted' });
      setShowEvidenceForm(true);
    } catch (error) {
      console.error('Failed to accept challenge:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleComplete = async () => {
    if (!dailyChallenge || !challenge) return;
    setIsCompleting(true);

    try {
      await challengeAPI.completeChallenge(dailyChallenge.id, {
        evidenceType: challenge.evidenceType,
        evidenceUrl: evidenceUrl || undefined,
        reflectionText: reflection || undefined,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to complete challenge:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge || !dailyChallenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Challenge not found</p>
        </div>
      </div>
    );
  }

  const isPending = dailyChallenge.status === 'pending';
  const isAccepted = dailyChallenge.status === 'accepted';
  const canSubmitEvidence = challenge.evidenceType === 'honor' || evidenceUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-safe py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-safe py-12">
        <div className="max-w-3xl mx-auto">
          {/* Challenge Card */}
          <div className={cn(
            "bg-white rounded-xl shadow-lg overflow-hidden border-l-8 mb-8",
            getZoneBorderColor(challenge.zone)
          )}>
            <div className="p-8">
              {/* Meta Info */}
              <div className="flex items-center gap-3 mb-6">
                <span className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium text-white',
                  getZoneColor(challenge.zone)
                )}>
                  {getZoneLabel(challenge.zone)}
                </span>
                <span className="text-sm text-gray-600">
                  {getDifficultyLabel(challenge.difficulty)}
                </span>
                <span className="text-sm text-gray-600">•</span>
                <span className="text-sm text-gray-600">{challenge.estimatedTime} min</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {challenge.title}
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {challenge.description}
              </p>

              {/* Implementation Intention */}
              <div className="bg-primary-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-bold text-primary-900 mb-3">
                  Implementation Intention
                </h2>
                <p className="text-gray-700">
                  <strong>When:</strong> {challenge.implementationIntention.trigger}
                </p>
                <p className="text-gray-700">
                  <strong>I will:</strong> {challenge.implementationIntention.action}
                </p>
              </div>

              {/* Identity Frame */}
              <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold mb-3">Identity Frame</h2>
                <p className="text-lg italic">&quot;{challenge.identityFrame}&quot;</p>
              </div>

              {/* Meaning Connection */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Why This Matters</h2>
                <p className="text-gray-700">{challenge.meaningConnection}</p>
              </div>

              {/* Accept Button */}
              {isPending && !showEvidenceForm && (
                <Button
                  onClick={handleAccept}
                  isLoading={isAccepting}
                  fullWidth
                  size="lg"
                >
                  Accept Challenge
                </Button>
              )}

              {/* Evidence Submission Form */}
              {(isAccepted || showEvidenceForm) && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Evidence</h2>
                    <EvidenceUpload
                      evidenceType={challenge.evidenceType}
                      onUploadComplete={setEvidenceUrl}
                      onError={(err) => console.error(err)}
                    />
                  </div>

                  {/* Reflection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reflection (Optional)
                    </label>
                    <textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="How did it feel? What did you learn about yourself?"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleComplete}
                    isLoading={isCompleting}
                    disabled={!canSubmitEvidence}
                    fullWidth
                    size="lg"
                  >
                    Complete Challenge
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
