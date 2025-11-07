/**
 * Utility functions for Momentum App
 */

import { format, formatDistanceToNow, isToday, parseISO } from 'date-fns';
import type { AvoidanceZone, ChallengeDifficulty } from '@momentum/shared';

// ============================================================================
// Class Name Utilities
// ============================================================================

/**
 * Combines class names conditionally
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ============================================================================
// Zone Color Utilities
// ============================================================================

/**
 * Get Tailwind color class for a zone
 */
export function getZoneColor(zone: AvoidanceZone): string {
  const colors: Record<AvoidanceZone, string> = {
    social: 'bg-social-500',
    physical: 'bg-physical-500',
    professional: 'bg-professional-500',
    emotional: 'bg-emotional-500',
  };
  return colors[zone];
}

/**
 * Get Tailwind text color class for a zone
 */
export function getZoneTextColor(zone: AvoidanceZone): string {
  const colors: Record<AvoidanceZone, string> = {
    social: 'text-social-600',
    physical: 'text-physical-600',
    professional: 'text-professional-600',
    emotional: 'text-emotional-600',
  };
  return colors[zone];
}

/**
 * Get Tailwind border color class for a zone
 */
export function getZoneBorderColor(zone: AvoidanceZone): string {
  const colors: Record<AvoidanceZone, string> = {
    social: 'border-social-500',
    physical: 'border-physical-500',
    professional: 'border-professional-500',
    emotional: 'border-emotional-500',
  };
  return colors[zone];
}

/**
 * Get hex color for a zone (for canvas rendering)
 */
export function getZoneHexColor(zone: AvoidanceZone): string {
  const colors: Record<AvoidanceZone, string> = {
    social: '#f97316',
    physical: '#22c55e',
    professional: '#a855f7',
    emotional: '#3b82f6',
  };
  return colors[zone];
}

/**
 * Get zone label with proper capitalization
 */
export function getZoneLabel(zone: AvoidanceZone): string {
  const labels: Record<AvoidanceZone, string> = {
    social: 'Social',
    physical: 'Physical',
    professional: 'Professional',
    emotional: 'Emotional',
  };
  return labels[zone];
}

// ============================================================================
// Difficulty Utilities
// ============================================================================

/**
 * Get difficulty label
 */
export function getDifficultyLabel(difficulty: ChallengeDifficulty): string {
  const labels: Record<ChallengeDifficulty, string> = {
    low: 'Low',
    'medium-low': 'Medium-Low',
    medium: 'Medium',
    'medium-high': 'Medium-High',
    high: 'High',
  };
  return labels[difficulty];
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: ChallengeDifficulty): string {
  const colors: Record<ChallengeDifficulty, string> = {
    low: 'text-green-600',
    'medium-low': 'text-lime-600',
    medium: 'text-yellow-600',
    'medium-high': 'text-orange-600',
    high: 'text-red-600',
  };
  return colors[difficulty];
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Format date for display
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Check if date is today
 */
export function isDateToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
}

/**
 * Format time for display (e.g., "2:30 PM")
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'h:mm a');
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ============================================================================
// Number Utilities
// ============================================================================

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

// ============================================================================
// File Utilities
// ============================================================================

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if file type is valid
 */
export function isValidFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Check if file size is within limit
 */
export function isValidFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes;
}

// ============================================================================
// Local Storage Utilities
// ============================================================================

/**
 * Safe localStorage getter
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Safe localStorage setter
 */
export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
}

/**
 * Remove item from localStorage
 */
export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
  }
}

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

// ============================================================================
// Identity Frame Utilities
// ============================================================================

/**
 * Get a random identity frame for a zone (client-side fallback)
 */
export function getIdentityFrameForZone(zone: AvoidanceZone): string {
  const frames: Record<AvoidanceZone, string[]> = {
    social: [
      "This is what someone who values authentic connection does.",
      "This is evidence you're someone who shows up for relationships.",
      "This is what courageous communicators do."
    ],
    physical: [
      "This is what someone who respects their body does.",
      "This is evidence you're someone who embraces discomfort.",
      "This is what disciplined people do."
    ],
    professional: [
      "This is what leaders do.",
      "This is evidence you're someone who takes ownership.",
      "This is what growth-oriented professionals do."
    ],
    emotional: [
      "This is what emotionally mature people do.",
      "This is evidence you're someone who faces their truth.",
      "This is what self-aware individuals do."
    ]
  };

  const zoneFrames = frames[zone];
  return zoneFrames[Math.floor(Math.random() * zoneFrames.length)];
}
