import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useProgress } from '../src/hooks/useProgress';
import { StatCard } from '../src/components/StatCard';
import { ProgressBar } from '../src/components/ProgressBar';
import { getPointsForNextLevel } from '../src/utils/gamification';
import { format } from 'date-fns';

export default function ProgressScreen() {
  const { progress, loading } = useProgress();

  if (loading || !progress) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const pointsForNextLevel = getPointsForNextLevel(progress.totalPoints);
  const currentLevelPoints = (progress.level - 1) * 100;
  const pointsInLevel = progress.totalPoints - currentLevelPoints;

  // Get recent completions
  const recentChallenges = progress.completedChallenges
    .slice(-10)
    .reverse();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Level Section */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelIcon}>🏆</Text>
            <View style={styles.levelText}>
              <Text style={styles.levelTitle}>Level {progress.level}</Text>
              <Text style={styles.levelSubtitle}>
                {pointsInLevel} / 100 XP
              </Text>
            </View>
          </View>
          <ProgressBar
            current={pointsInLevel}
            max={100}
            color="#6366f1"
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              icon="🔥"
              value={progress.currentStreak}
              label="Current Streak"
              color="#ef4444"
            />
            <StatCard
              icon="📈"
              value={progress.longestStreak}
              label="Longest Streak"
              color="#f59e0b"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="⭐"
              value={progress.totalPoints}
              label="Total Points"
              color="#10b981"
            />
            <StatCard
              icon="✅"
              value={progress.completedChallenges.length}
              label="Challenges Done"
              color="#8b5cf6"
            />
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Achievements ({progress.achievements.length})
          </Text>
          {progress.achievements.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Complete challenges to unlock achievements!
              </Text>
            </View>
          ) : (
            <View style={styles.achievementsGrid}>
              {progress.achievements.map(achievement => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentChallenges.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No completed challenges yet. Start your journey today!
              </Text>
            </View>
          ) : (
            <View>
              {recentChallenges.map((completed, index) => (
                <View key={index} style={styles.activityCard}>
                  <View style={styles.activityLeft}>
                    <Text style={styles.activityIcon}>✓</Text>
                    <View>
                      <Text style={styles.activityTitle}>
                        Challenge Completed
                      </Text>
                      <Text style={styles.activityDate}>
                        {format(new Date(completed.completedAt), 'MMM d, yyyy')}
                      </Text>
                    </View>
                  </View>
                  {completed.rating && (
                    <View style={styles.activityRight}>
                      <Text style={styles.activityRating}>
                        {'⭐'.repeat(completed.rating)}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  levelText: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  levelSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsGrid: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
    color: '#10b981',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  activityDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityRight: {
    marginLeft: 8,
  },
  activityRating: {
    fontSize: 14,
  },
});
