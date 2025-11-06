/**
 * Shared TypeScript types for Momentum App
 * Used across backend, frontend, and mobile applications
 */

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
  createdAt: Date;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: Date;
}

export type SubscriptionStatus = 'free_trial' | 'premium' | 'expired' | 'cancelled';

// ============================================================================
// AVOIDANCE PROFILE TYPES
// ============================================================================

export type AvoidanceZone = 'social' | 'physical' | 'professional' | 'emotional';

export interface AvoidanceProfile {
  userId: string;
  socialScore: number;      // 0-10 scale (higher = more avoidance)
  physicalScore: number;
  professionalScore: number;
  emotionalScore: number;
  primaryZone: AvoidanceZone;
  secondaryZone: AvoidanceZone;
  intensityPreference: '5min' | '10min' | '15min';
  changeStyle: 'gradual' | 'moderate' | 'aggressive';
  assessedAt: Date;
  updatedAt: Date;
}

export interface AvoidanceScores {
  social: number;
  physical: number;
  professional: number;
  emotional: number;
}

// ============================================================================
// ASSESSMENT TYPES
// ============================================================================

export interface AssessmentQuestion {
  id: string;
  category: AvoidanceZone;
  question: string;
  type: 'scale' | 'frequency' | 'recency' | 'binary';
  options?: string[];
}

export interface AssessmentAnswer {
  questionId: string;
  value: number | string;
}

export interface AssessmentResult {
  userId: string;
  answers: AssessmentAnswer[];
  profile: AvoidanceProfile;
}

// ============================================================================
// CHALLENGE TYPES
// ============================================================================

export type ChallengeDifficulty = 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high';
export type EvidenceType = 'photo' | 'screenshot' | 'voice' | 'honor';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  zone: AvoidanceZone;
  difficulty: ChallengeDifficulty;
  estimatedTime: number; // minutes
  implementationIntention: ImplementationIntention;
  identityFrame: string;
  meaningConnection: string;
  evidenceType: EvidenceType;
  isActive: boolean;
  createdAt: Date;
}

export interface ImplementationIntention {
  trigger: string;
  action: string;
}

export interface DailyChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challenge?: Challenge; // Populated via join
  deliveredAt: Date;
  scheduledFor: Date;
  status: ChallengeStatus;
  completedAt?: Date;
  evidenceUrl?: string;
  evidenceType?: EvidenceType;
  reflectionText?: string;
}

export type ChallengeStatus = 'pending' | 'accepted' | 'completed' | 'skipped';

// ============================================================================
// PROGRESS TYPES
// ============================================================================

export interface RangeProgress {
  userId: string;
  dayNumber: number;
  date: Date;
  socialRadius: number;
  physicalRadius: number;
  professionalRadius: number;
  emotionalRadius: number;
}

export interface RangeMap {
  currentRadius: {
    social: number;
    physical: number;
    professional: number;
    emotional: number;
  };
  startRadius: number;
  expansionHistory: RangeExpansion[];
}

export interface RangeExpansion {
  day: number;
  zone: AvoidanceZone;
  expansion: number;
}

// ============================================================================
// STREAK TYPES
// ============================================================================

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date;
  freezeAvailable: boolean;
  freezeUsedThisWeek: boolean;
  updatedAt: Date;
}

// ============================================================================
// REWARD TYPES
// ============================================================================

export type RewardCardType = 'insight' | 'stat' | 'encouragement';

export interface RewardCard {
  id: string;
  userId: string;
  cardType: RewardCardType;
  cardContent: string;
  earnedAt: Date;
  isRead: boolean;
}

export interface TerritoryReport {
  userId: string;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  rangeExpansion: {
    social: number;
    physical: number;
    professional: number;
    emotional: number;
    total: number;
  };
  challengesCompleted: number;
  totalChallenges: number;
  evidenceSubmitted: {
    photos: number;
    screenshots: number;
    voice: number;
    honor: number;
  };
  identityShift?: string;
  nextWeekFocus: AvoidanceZone;
}

// ============================================================================
// JOURNAL TYPES
// ============================================================================

export interface EvidenceEntry {
  id: string;
  userId: string;
  dailyChallengeId: string;
  reflectionText: string;
  createdAt: Date;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  timezone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AssessmentSubmission {
  answers: AssessmentAnswer[];
}

export interface ChallengeCompletionRequest {
  evidenceType: EvidenceType;
  evidenceUrl?: string;
  reflectionText?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType =
  | 'challenge'
  | 'reminder'
  | 'completion'
  | 'milestone'
  | 'report';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export type AnalyticsEvent =
  | 'user_registered'
  | 'assessment_started'
  | 'assessment_completed'
  | 'challenge_delivered'
  | 'challenge_accepted'
  | 'challenge_completed'
  | 'challenge_skipped'
  | 'evidence_submitted'
  | 'reflection_added'
  | 'streak_milestone'
  | 'subscription_started'
  | 'subscription_cancelled';

export interface AnalyticsEventData {
  userId: string;
  event: AnalyticsEvent;
  properties?: Record<string, any>;
  timestamp: Date;
}

// ============================================================================
// CHALLENGE SELECTION TYPES
// ============================================================================

export interface ChallengeSelectionContext {
  user: User;
  profile: AvoidanceProfile;
  dayNumber: number;
  completedChallenges: string[]; // Challenge IDs
  currentTime: Date;
}

export interface ChallengeCandidate {
  challenge: Challenge;
  score: number; // Personalization score
  reasoning: string;
}
