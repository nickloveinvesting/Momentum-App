/**
 * Progress Page
 * Shows Range Map visualization and stats
 */

'use client';

import { useEffect, useState } from 'react';
import { progressAPI } from '@/lib/api';
import type { RangeMap as RangeMapType, Streak } from '@momentum/shared';
import RangeMap from '../components/RangeMap';
import StreakDisplay from '../components/StreakDisplay';

interface StatsData {
  totalCompleted: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

export default function ProgressPage() {
  const [rangeMap, setRangeMap] = useState<RangeMapType | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rangeMapData, streakData, statsData] = await Promise.all([
          progressAPI.getRangeMap(),
          progressAPI.getStreak(),
          progressAPI.getStats(),
        ]);

        setRangeMap(rangeMapData);
        setStreak(streakData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch progress data:', error);
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
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-safe py-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
          <p className="text-gray-600 mt-1">Track your comfort zone expansion over time</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-safe py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Range Map */}
          {rangeMap && (
            <RangeMap rangeMap={rangeMap} showComparison={true} animated={true} />
          )}

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Streak */}
            {streak && (
              <div>
                <StreakDisplay streak={streak} variant="full" />
              </div>
            )}

            {/* Overview Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Challenges Completed</span>
                    <span className="text-3xl font-bold text-primary-900">
                      {stats?.totalCompleted || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-900 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats?.totalCompleted || 0) * 2, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="text-3xl font-bold text-primary-900">
                      {stats ? Math.round(stats.completionRate * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats ? stats.completionRate * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Streak</span>
                    <span className="text-3xl font-bold text-orange-500">
                      {streak?.currentStreak || 0} days
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Longest Streak</span>
                    <span className="text-3xl font-bold text-blue-500">
                      {stats?.longestStreak || 0} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expansion Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Zone Expansion</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {rangeMap && Object.entries(rangeMap.currentRadius).map(([zone, radius]) => (
                <div key={zone} className="text-center">
                  <div className="text-4xl font-bold text-primary-900 mb-2">
                    {Math.round(radius)}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{zone}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    +{Math.round(radius - rangeMap.startRadius)} from start
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
