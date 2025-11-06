/**
 * Shared utility functions
 */

import { AvoidanceZone, AvoidanceScores } from './types';

/**
 * Calculates the primary and secondary avoidance zones based on scores
 */
export function calculatePrimaryZones(scores: AvoidanceScores): {
  primary: AvoidanceZone;
  secondary: AvoidanceZone;
} {
  const entries = Object.entries(scores) as [AvoidanceZone, number][];
  entries.sort((a, b) => b[1] - a[1]); // Sort descending

  return {
    primary: entries[0][0],
    secondary: entries[1][0]
  };
}

/**
 * Calculates which zone to target for a given day based on profile
 */
export function getTargetZone(
  scores: AvoidanceScores,
  dayNumber: number,
  previousZones: AvoidanceZone[]
): AvoidanceZone {
  const weekNumber = Math.ceil(dayNumber / 7);
  const { primary, secondary } = calculatePrimaryZones(scores);

  // Week 1: Focus on primary zone
  if (weekNumber === 1) {
    return primary;
  }

  // Week 2-3: Rotate between zones, weighted by avoidance
  if (weekNumber <= 3) {
    // Avoid repeating the same zone consecutively
    const lastZone = previousZones[previousZones.length - 1];
    const zones = Object.keys(scores) as AvoidanceZone[];
    const availableZones = zones.filter(z => z !== lastZone);

    // Weight by avoidance scores
    return weightedRandomZone(
      availableZones.reduce((acc, z) => {
        acc[z] = scores[z];
        return acc;
      }, {} as AvoidanceScores)
    );
  }

  // Week 4: Target biggest growth area
  return primary;
}

/**
 * Weighted random selection based on avoidance scores
 */
function weightedRandomZone(scores: Partial<AvoidanceScores>): AvoidanceZone {
  const entries = Object.entries(scores) as [AvoidanceZone, number][];
  const totalWeight = entries.reduce((sum, [_, score]) => sum + score, 0);

  let random = Math.random() * totalWeight;

  for (const [zone, score] of entries) {
    random -= score;
    if (random <= 0) {
      return zone;
    }
  }

  return entries[0][0]; // Fallback
}

/**
 * Formats a date for user's timezone
 */
export function formatDateInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Calculates days between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const startMs = start.getTime();
  const endMs = end.getTime();
  return Math.floor((endMs - startMs) / msPerDay);
}

/**
 * Checks if a date is today in user's timezone
 */
export function isToday(date: Date, timezone: string): boolean {
  const now = new Date();
  const userDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const userNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));

  return (
    userDate.getFullYear() === userNow.getFullYear() &&
    userDate.getMonth() === userNow.getMonth() &&
    userDate.getDate() === userNow.getDate()
  );
}

/**
 * Generates a random item from array based on weights
 */
export function weightedRandom<T>(items: T[], weights: number[]): T {
  if (items.length !== weights.length) {
    throw new Error('Items and weights must have the same length');
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[0]; // Fallback
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Truncates text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generates a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
