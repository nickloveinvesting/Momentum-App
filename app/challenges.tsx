import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CHALLENGES } from '../src/data/challenges';
import { ChallengeCategory } from '../src/types';
import { ChallengeCard } from '../src/components/ChallengeCard';

const categories = [
  { key: 'all', label: 'All' },
  { key: ChallengeCategory.SOCIAL, label: 'Social' },
  { key: ChallengeCategory.PHYSICAL, label: 'Physical' },
  { key: ChallengeCategory.MENTAL, label: 'Mental' },
  { key: ChallengeCategory.CREATIVE, label: 'Creative' },
  { key: ChallengeCategory.PROFESSIONAL, label: 'Professional' },
  { key: ChallengeCategory.WELLNESS, label: 'Wellness' },
];

export default function ChallengesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredChallenges =
    selectedCategory === 'all'
      ? CHALLENGES
      : CHALLENGES.filter(c => c.category === selectedCategory);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryButton,
              selectedCategory === cat.key && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === cat.key && styles.categoryButtonTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Challenges List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>
          {filteredChallenges.length} Challenges
        </Text>
        {filteredChallenges.map(challenge => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  categoryScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryScrollContent: {
    padding: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#6366f1',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
});
