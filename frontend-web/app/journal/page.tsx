/**
 * Journal Page
 * Shows all completed challenges with reflections
 */

'use client';

import { useEffect, useState } from 'react';
import { challengeAPI, journalAPI } from '@/lib/api';
import type { DailyChallenge } from '@momentum/shared';
import { formatDate, getZoneColor, getZoneLabel } from '@/lib/utils';
import Button from '../components/Button';

export default function JournalPage() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const history = await challengeAPI.getChallengeHistory();
        const completed = history.filter(c => c.status === 'completed');
        setChallenges(completed);
      } catch (error) {
        console.error('Failed to fetch journal:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournal();
  }, []);

  const handleExport = async () => {
    try {
      const blob = await journalAPI.exportJournal();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `momentum-journal-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
    } catch (error) {
      console.error('Failed to export journal:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-safe py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
              <p className="text-gray-600 mt-1">
                {challenges.length} completed challenge{challenges.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button onClick={handleExport} variant="outline">
              Export to PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-safe py-12">
        <div className="max-w-4xl mx-auto">
          {challenges.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Entries Yet</h3>
              <p className="text-gray-600">
                Complete your first challenge to start building your journal.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {challenges.map((dailyChallenge) => (
                <div
                  key={dailyChallenge.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {dailyChallenge.challenge && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getZoneColor(dailyChallenge.challenge.zone)}`}>
                              {getZoneLabel(dailyChallenge.challenge.zone)}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatDate(dailyChallenge.completedAt || dailyChallenge.deliveredAt)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {dailyChallenge.challenge?.title || 'Challenge'}
                        </h3>
                      </div>
                      <div className="flex items-center text-green-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    {/* Reflection */}
                    {dailyChallenge.reflectionText && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Reflection</h4>
                        <p className="text-gray-700 italic">&quot;{dailyChallenge.reflectionText}&quot;</p>
                      </div>
                    )}

                    {/* Evidence */}
                    {dailyChallenge.evidenceUrl && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Evidence</h4>
                        {dailyChallenge.evidenceType === 'photo' || dailyChallenge.evidenceType === 'screenshot' ? (
                          <img
                            src={dailyChallenge.evidenceUrl}
                            alt="Evidence"
                            className="rounded-lg max-w-full h-auto"
                          />
                        ) : dailyChallenge.evidenceType === 'voice' ? (
                          <audio controls className="w-full">
                            <source src={dailyChallenge.evidenceUrl} />
                          </audio>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
