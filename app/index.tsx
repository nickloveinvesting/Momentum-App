import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useDailyChallenge } from '../src/hooks/useDailyChallenge';
import { useProgress } from '../src/hooks/useProgress';
import { ChallengeCard } from '../src/components/ChallengeCard';
import { StatCard } from '../src/components/StatCard';
import { format } from 'date-fns';

export default function HomeScreen() {
  const { dailyChallenge, loading, markChallengeComplete, refreshChallenge } =
    useDailyChallenge();
  const { progress, completeChallenge } = useProgress();
  const [modalVisible, setModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);

  const handleCompleteChallenge = async () => {
    if (!dailyChallenge || !progress) return;

    const result = await completeChallenge(
      dailyChallenge.challenge,
      notes,
      rating || undefined
    );

    if (result) {
      await markChallengeComplete();
      setModalVisible(false);
      setNotes('');
      setRating(0);

      if (result.newAchievements.length > 0) {
        const achievementTitles = result.newAchievements
          .map(a => `${a.icon} ${a.title}`)
          .join('\n');
        Alert.alert(
          '🎉 New Achievement!',
          `You unlocked:\n\n${achievementTitles}`
        );
      }
    }
  };

  if (loading || !progress) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
          <Text style={styles.greeting}>Ready to grow today?</Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="🔥"
            value={progress.currentStreak}
            label="Day Streak"
            color="#ef4444"
          />
          <StatCard
            icon="⭐"
            value={progress.totalPoints}
            label="Total Points"
            color="#f59e0b"
          />
          <StatCard
            icon="🏆"
            value={progress.level}
            label="Level"
            color="#8b5cf6"
          />
        </View>

        {/* Daily Challenge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Challenge</Text>
          {dailyChallenge ? (
            <>
              <ChallengeCard
                challenge={dailyChallenge.challenge}
                completed={dailyChallenge.completed}
                onPress={() => !dailyChallenge.completed && setModalVisible(true)}
              />
              {!dailyChallenge.completed && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.buttonText}>Complete Challenge</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text>Loading challenge...</Text>
          )}
        </View>

        {/* Motivational Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>
            "Life begins at the end of your comfort zone."
          </Text>
          <Text style={styles.quoteAuthor}>- Neale Donald Walsch</Text>
        </View>
      </ScrollView>

      {/* Complete Challenge Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Challenge</Text>

            <Text style={styles.inputLabel}>How did it go? (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Add your notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Rate your experience:</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Text style={styles.star}>
                    {star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.completeButton]}
                onPress={handleCompleteChallenge}
              >
                <Text style={styles.completeButtonText}>Complete ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    marginBottom: 24,
  },
  date: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    marginHorizontal: -4,
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
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quoteContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 32,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#6366f1',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
