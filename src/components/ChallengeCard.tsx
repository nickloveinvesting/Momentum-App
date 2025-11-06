import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Challenge } from '../types';
import { getCategoryColor, getCategoryIcon } from '../utils/gamification';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress?: () => void;
  completed?: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onPress,
  completed = false,
}) => {
  const categoryColor = getCategoryColor(challenge.category);
  const categoryIcon = getCategoryIcon(challenge.category);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: categoryColor },
        completed && styles.completed,
      ]}
      onPress={onPress}
      disabled={completed}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{categoryIcon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.category}>
            {challenge.category.toUpperCase()} • {challenge.difficulty.toUpperCase()}
          </Text>
        </View>
        <View style={styles.points}>
          <Text style={styles.pointsText}>{challenge.points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
      <Text style={styles.description}>{challenge.description}</Text>
      {completed && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>✓ Completed</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completed: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  points: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  pointsLabel: {
    fontSize: 10,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  completedBadge: {
    marginTop: 12,
    backgroundColor: '#10b981',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
