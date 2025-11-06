/**
 * Journal Routes
 * Routes for journal/evidence entries
 */

import { Router } from 'express';
import {
  getJournalEntries,
  createJournalEntry,
  getJournalEntry,
} from '../controllers/journalController';
import { authenticate } from '../middleware/auth';
import { validateJournalEntry, validate } from '../middleware/validator';

const router = Router();

// All journal routes require authentication
router.use(authenticate);

/**
 * GET /api/journal/entries
 * Get all journal entries for the authenticated user
 */
router.get('/entries', getJournalEntries);

/**
 * GET /api/journal/entry/:id
 * Get a specific journal entry by ID
 */
router.get('/entry/:id', getJournalEntry);

/**
 * POST /api/journal/entry
 * Create a new journal entry
 */
router.post('/entry', validateJournalEntry, validate, createJournalEntry);

export default router;
