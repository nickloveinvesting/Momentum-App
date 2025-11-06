/**
 * Journal Controller
 * Handles journal/evidence entry requests
 */

import { Request, Response } from 'express';
import { EvidenceEntry } from '@momentum/shared';
import { query } from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';

interface EvidenceEntryRow {
  id: string;
  user_id: string;
  daily_challenge_id: string;
  reflection_text: string;
  created_at: Date;
}

/**
 * Convert database row to EvidenceEntry object
 */
function rowToEvidenceEntry(row: EvidenceEntryRow): EvidenceEntry {
  return {
    id: row.id,
    userId: row.user_id,
    dailyChallengeId: row.daily_challenge_id,
    reflectionText: row.reflection_text,
    createdAt: new Date(row.created_at),
  };
}

/**
 * Get all journal entries for user
 * GET /api/journal/entries
 */
export const getJournalEntries = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query<EvidenceEntryRow>(
      `SELECT * FROM evidence_entries
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.userId, limit, offset]
    );

    const entries = result.rows.map(rowToEvidenceEntry);

    res.status(200).json(entries);
  }
);

/**
 * Create a new journal entry
 * POST /api/journal/entry
 */
export const createJournalEntry = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { dailyChallengeId, reflectionText } = req.body;

    // Verify the daily challenge belongs to the user
    const challengeCheck = await query(
      `SELECT id FROM daily_challenges
       WHERE id = $1 AND user_id = $2`,
      [dailyChallengeId, req.user.userId]
    );

    if (challengeCheck.rows.length === 0) {
      throw new AppError('Challenge not found or does not belong to user', 404);
    }

    // Check if entry already exists for this challenge
    const existingEntry = await query(
      'SELECT id FROM evidence_entries WHERE daily_challenge_id = $1',
      [dailyChallengeId]
    );

    if (existingEntry.rows.length > 0) {
      throw new AppError('Journal entry already exists for this challenge', 409);
    }

    // Create the journal entry
    const result = await query<EvidenceEntryRow>(
      `INSERT INTO evidence_entries (user_id, daily_challenge_id, reflection_text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.userId, dailyChallengeId, reflectionText]
    );

    const entry = rowToEvidenceEntry(result.rows[0]);

    res.status(201).json(entry);
  }
);

/**
 * Get a specific journal entry
 * GET /api/journal/entry/:id
 */
export const getJournalEntry = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    const result = await query<EvidenceEntryRow>(
      `SELECT * FROM evidence_entries
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Journal entry not found', 404);
    }

    const entry = rowToEvidenceEntry(result.rows[0]);

    res.status(200).json(entry);
  }
);
