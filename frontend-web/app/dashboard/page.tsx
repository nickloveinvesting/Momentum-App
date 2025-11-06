/**
 * Dashboard Page
 * Shows today's challenge, streak, and quick stats
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { challengeAPI, progressAPI } from '@/lib/api';
import { useMomentumStore } from '@/lib/store';
import type { DailyChallenge, Challenge } from '@momentum/shared';
import ChallengeCard from '../components/ChallengeCard';
import StreakDisplay from '../components/StreakDisplay';
import Button from '../components/Button';

export default function DashboardPage() {
  const { auth, setTodayChallenge, setStreak, setStats } = useMomentumStore();
  const [todayChallenge, setTodayChallengeLocal] = useState<DailyChallenge | null>(null);
  const [challenge, setChallengeLocal] = useState<Challenge | null>(null);
  const [streak, setStreakLocal] = useState<any>(null);
  const [stats, setStatsLocal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [challengeData, streakData, statsData] = await Promise.all([
          challengeAPI.getTodayChallenge(),
          progressAPI.getStreak(),
          progressAPI.getStats(),
        ]);

        if (challengeData) {
          setTodayChallengeLocal(challengeData);
          if (challengeData.challenge) {
            setChallengeLocal(challengeData.challenge);
          }
          setTodayChallenge(challengeData);
        }

        setStreakLocal(streakData);
        setStreak(streakData);
        setStatsLocal(statsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {auth.user?.name}</p>
            </div>
            <Link href="/progress">
              <Button variant="outline">View Progress</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-safe py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Today's Challenge */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Today's Challenge</h2>

            {todayChallenge && challenge ? (
              <ChallengeCard dailyChallenge={todayChallenge} challenge={challenge} />
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600 mb-6">
                  You've completed today's challenge. Come back tomorrow for your next one.
                </p>
                <Link href="/journal">
                  <Button variant="outline">View Your Journal</Button>
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/journal" className="block">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emotional-100 text-emotional-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Journal</h3>
                      <p className="text-sm text-gray-600">Review your progress</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/progress" className="block">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-professional-100 text-professional-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Range Map</h3>
                      <p className="text-sm text-gray-600">Visualize your expansion</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Streak */}
            {streak && <StreakDisplay streak={streak} variant="full" />}

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Completed</span>
                  <span className="text-2xl font-bold text-primary-900">
                    {stats?.totalCompleted || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="text-2xl font-bold text-primary-900">
                    {stats ? Math.round(stats.completionRate * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Longest Streak</span>
                  <span className="text-2xl font-bold text-primary-900">
                    {stats?.longestStreak || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
