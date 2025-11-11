/**
 * API Client for Momentum App
 * Handles all HTTP requests to the backend with authentication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  AssessmentSubmission,
  AssessmentResult,
  DailyChallenge,
  Challenge,
  ChallengeCompletionRequest,
  Streak,
  RangeMap,
  EvidenceEntry,
  TerritoryReport,
  RewardCard,
  ApiError,
} from '@momentum/shared';

// API Configuration
function getApiBaseUrl(): string {
  // For production (Vercel): MUST be explicitly set
  if (process.env.NODE_ENV === 'production') {
    // Fallback to working backend if env var not set
    return process.env.NEXT_PUBLIC_API_URL || 'https://momentum-backend-gamma.vercel.app';
  }

  // For development: use local backend
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with better error handling
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Detect connectivity issues (backend unreachable)
    if (!error.response) {
      console.error(
        '🔴 Backend unreachable. Check that backend is running at:',
        API_BASE_URL
      );
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Format error message
    const apiError: ApiError = {
      error: error.response?.data?.error || 'Unknown error',
      message: error.response?.data?.message || error.message,
      statusCode: error.response?.status || 500,
    };

    return Promise.reject(apiError);
  }
);

// ============================================================================
// Authentication APIs
// ============================================================================

export const authAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },
};

// ============================================================================
// Assessment APIs
// ============================================================================

export const assessmentAPI = {
  submitAssessment: async (data: AssessmentSubmission): Promise<AssessmentResult> => {
    const response = await apiClient.post<AssessmentResult>('/api/assessment/submit', data);
    return response.data;
  },

  getProfile: async (): Promise<AssessmentResult> => {
    const response = await apiClient.get<AssessmentResult>('/api/assessment/profile');
    return response.data;
  },
};

// ============================================================================
// Challenge APIs
// ============================================================================

export const challengeAPI = {
  getTodayChallenge: async (): Promise<DailyChallenge | null> => {
    const response = await apiClient.get<DailyChallenge | null>('/api/challenges/today');
    return response.data;
  },

  getChallengeById: async (id: string): Promise<Challenge> => {
    const response = await apiClient.get<Challenge>(`/api/challenges/${id}`);
    return response.data;
  },

  acceptChallenge: async (dailyChallengeId: string): Promise<DailyChallenge> => {
    const response = await apiClient.post<DailyChallenge>(
      `/api/challenges/${dailyChallengeId}/accept`
    );
    return response.data;
  },

  completeChallenge: async (
    dailyChallengeId: string,
    data: ChallengeCompletionRequest
  ): Promise<DailyChallenge> => {
    const response = await apiClient.post<DailyChallenge>(
      `/api/challenges/${dailyChallengeId}/complete`,
      data
    );
    return response.data;
  },

  skipChallenge: async (dailyChallengeId: string): Promise<DailyChallenge> => {
    const response = await apiClient.post<DailyChallenge>(
      `/api/challenges/${dailyChallengeId}/skip`
    );
    return response.data;
  },

  getChallengeHistory: async (): Promise<DailyChallenge[]> => {
    const response = await apiClient.get<DailyChallenge[]>('/api/challenges/history');
    return response.data;
  },
};

// ============================================================================
// Progress APIs
// ============================================================================

export const progressAPI = {
  getStreak: async (): Promise<Streak> => {
    const response = await apiClient.get<Streak>('/api/progress/streak');
    return response.data;
  },

  getRangeMap: async (): Promise<RangeMap> => {
    const response = await apiClient.get<RangeMap>('/api/progress/range-map');
    return response.data;
  },

  getStats: async (): Promise<{
    totalCompleted: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
  }> => {
    const response = await apiClient.get('/api/progress/stats');
    return response.data;
  },
};

// ============================================================================
// Journal APIs
// ============================================================================

export const journalAPI = {
  getEntries: async (): Promise<EvidenceEntry[]> => {
    const response = await apiClient.get<EvidenceEntry[]>('/api/journal/entries');
    return response.data;
  },

  exportJournal: async (): Promise<Blob> => {
    const response = await apiClient.get('/api/journal/export', {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ============================================================================
// Rewards APIs
// ============================================================================

export const rewardsAPI = {
  getRewardCards: async (): Promise<RewardCard[]> => {
    const response = await apiClient.get<RewardCard[]>('/api/rewards/cards');
    return response.data;
  },

  markCardAsRead: async (cardId: string): Promise<void> => {
    await apiClient.post(`/api/rewards/cards/${cardId}/read`);
  },

  getWeeklyReport: async (weekNumber?: number): Promise<TerritoryReport> => {
    const params = weekNumber ? { weekNumber } : {};
    const response = await apiClient.get<TerritoryReport>('/api/rewards/weekly-report', {
      params,
    });
    return response.data;
  },
};

// ============================================================================
// Upload APIs
// ============================================================================

export const uploadAPI = {
  uploadEvidence: async (file: File, type: 'photo' | 'screenshot' | 'voice'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await apiClient.post<{ url: string }>('/api/upload/evidence', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  },
};

// Default export
export default apiClient;
