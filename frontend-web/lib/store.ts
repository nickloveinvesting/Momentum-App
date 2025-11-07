/**
 * Zustand Global State Store for Momentum App
 * Manages user authentication, challenges, progress, and UI state
 */

import { create } from 'zustand';
import type {
  User,
  DailyChallenge,
  Streak,
  RangeMap,
  AvoidanceProfile,
  ApiError,
} from '@momentum/shared';

// ============================================================================
// State Types
// ============================================================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ApiError | null;
}

interface ChallengeState {
  todayChallenge: DailyChallenge | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface ProgressState {
  streak: Streak | null;
  rangeMap: RangeMap | null;
  stats: {
    totalCompleted: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
  } | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface ProfileState {
  profile: AvoidanceProfile | null;
  hasCompletedAssessment: boolean;
  isLoading: boolean;
  error: ApiError | null;
}

interface UIState {
  isSidebarOpen: boolean;
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  } | null;
}

// ============================================================================
// Store Interface
// ============================================================================

interface MomentumStore {
  // Auth State
  auth: AuthState;
  setUser: (user: User | null) => void;
  setAuthLoading: (isLoading: boolean) => void;
  setAuthError: (error: ApiError | null) => void;
  logout: () => void;

  // Challenge State
  challenge: ChallengeState;
  setTodayChallenge: (challenge: DailyChallenge | null) => void;
  setChallengeLoading: (isLoading: boolean) => void;
  setChallengeError: (error: ApiError | null) => void;

  // Progress State
  progress: ProgressState;
  setStreak: (streak: Streak) => void;
  setRangeMap: (rangeMap: RangeMap) => void;
  setStats: (stats: ProgressState['stats']) => void;
  setProgressLoading: (isLoading: boolean) => void;
  setProgressError: (error: ApiError | null) => void;

  // Profile State
  profile: ProfileState;
  setProfile: (profile: AvoidanceProfile | null) => void;
  setHasCompletedAssessment: (hasCompleted: boolean) => void;
  setProfileLoading: (isLoading: boolean) => void;
  setProfileError: (error: ApiError | null) => void;

  // UI State
  ui: UIState;
  toggleSidebar: () => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // Global Actions
  resetStore: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const initialChallengeState: ChallengeState = {
  todayChallenge: null,
  isLoading: false,
  error: null,
};

const initialProgressState: ProgressState = {
  streak: null,
  rangeMap: null,
  stats: null,
  isLoading: false,
  error: null,
};

const initialProfileState: ProfileState = {
  profile: null,
  hasCompletedAssessment: false,
  isLoading: false,
  error: null,
};

const initialUIState: UIState = {
  isSidebarOpen: false,
  isModalOpen: false,
  modalContent: null,
  toast: null,
};

// ============================================================================
// Zustand Store
// ============================================================================

export const useMomentumStore = create<MomentumStore>((set) => ({
  // Auth State & Actions
  auth: initialAuthState,

  setUser: (user) =>
    set((state) => ({
      auth: {
        ...state.auth,
        user,
        isAuthenticated: !!user,
      },
    })),

  setAuthLoading: (isLoading) =>
    set((state) => ({
      auth: { ...state.auth, isLoading },
    })),

  setAuthError: (error) =>
    set((state) => ({
      auth: { ...state.auth, error },
    })),

  logout: () =>
    set(() => ({
      auth: initialAuthState,
      challenge: initialChallengeState,
      progress: initialProgressState,
      profile: initialProfileState,
    })),

  // Challenge State & Actions
  challenge: initialChallengeState,

  setTodayChallenge: (todayChallenge) =>
    set((state) => ({
      challenge: { ...state.challenge, todayChallenge },
    })),

  setChallengeLoading: (isLoading) =>
    set((state) => ({
      challenge: { ...state.challenge, isLoading },
    })),

  setChallengeError: (error) =>
    set((state) => ({
      challenge: { ...state.challenge, error },
    })),

  // Progress State & Actions
  progress: initialProgressState,

  setStreak: (streak) =>
    set((state) => ({
      progress: { ...state.progress, streak },
    })),

  setRangeMap: (rangeMap) =>
    set((state) => ({
      progress: { ...state.progress, rangeMap },
    })),

  setStats: (stats) =>
    set((state) => ({
      progress: { ...state.progress, stats },
    })),

  setProgressLoading: (isLoading) =>
    set((state) => ({
      progress: { ...state.progress, isLoading },
    })),

  setProgressError: (error) =>
    set((state) => ({
      progress: { ...state.progress, error },
    })),

  // Profile State & Actions
  profile: initialProfileState,

  setProfile: (profile) =>
    set((state) => ({
      profile: { ...state.profile, profile },
    })),

  setHasCompletedAssessment: (hasCompletedAssessment) =>
    set((state) => ({
      profile: { ...state.profile, hasCompletedAssessment },
    })),

  setProfileLoading: (isLoading) =>
    set((state) => ({
      profile: { ...state.profile, isLoading },
    })),

  setProfileError: (error) =>
    set((state) => ({
      profile: { ...state.profile, error },
    })),

  // UI State & Actions
  ui: initialUIState,

  toggleSidebar: () =>
    set((state) => ({
      ui: { ...state.ui, isSidebarOpen: !state.ui.isSidebarOpen },
    })),

  openModal: (content) =>
    set((state) => ({
      ui: { ...state.ui, isModalOpen: true, modalContent: content },
    })),

  closeModal: () =>
    set((state) => ({
      ui: { ...state.ui, isModalOpen: false, modalContent: null },
    })),

  showToast: (message, type) =>
    set((state) => ({
      ui: {
        ...state.ui,
        toast: { message, type, isVisible: true },
      },
    })),

  hideToast: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        toast: state.ui.toast ? { ...state.ui.toast, isVisible: false } : null,
      },
    })),

  // Global Actions
  resetStore: () =>
    set({
      auth: initialAuthState,
      challenge: initialChallengeState,
      progress: initialProgressState,
      profile: initialProfileState,
      ui: initialUIState,
    }),
}));

// Selectors for optimized re-renders
export const useAuth = () => useMomentumStore((state) => state.auth);
export const useChallenge = () => useMomentumStore((state) => state.challenge);
export const useProgress = () => useMomentumStore((state) => state.progress);
export const useProfile = () => useMomentumStore((state) => state.profile);
export const useUI = () => useMomentumStore((state) => state.ui);
