/**
 * Assessment Controller
 * Handles assessment submission and profile management
 */

import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

interface AssessmentAnswer {
  questionId: string;
  value: number | string;
}

interface AssessmentSubmission {
  answers: AssessmentAnswer[];
}

/**
 * Calculate assessment scores from answers
 * This is a simplified scoring algorithm for the 23-question assessment
 */
function calculateScores(answers: AssessmentAnswer[]): {
  socialScore: number;
  physicalScore: number;
  professionalScore: number;
  emotionalScore: number;
  primaryZone: string;
  secondaryZone: string;
  intensityPreference: string;
  changeStyle: string;
} {
  // Initialize zone scores
  const scores = {
    social: 0,
    physical: 0,
    professional: 0,
    emotional: 0,
  };

  const counts = {
    social: 0,
    physical: 0,
    professional: 0,
    emotional: 0,
  };

  // Extract preferences
  let intensityPreference = '10min';
  let changeStyle = 'moderate';

  // Process each answer
  answers.forEach((answer) => {
    const qid = parseInt(answer.questionId);
    const value = typeof answer.value === 'number' ? answer.value :
                  typeof answer.value === 'string' ? parseInt(answer.value as string) || 0 : 0;

    // Questions 1-5: Social zone
    if (qid >= 1 && qid <= 5) {
      scores.social += value;
      counts.social++;
    }
    // Questions 6-10: Physical zone
    else if (qid >= 6 && qid <= 10) {
      scores.physical += value;
      counts.physical++;
    }
    // Questions 11-15: Professional zone
    else if (qid >= 11 && qid <= 15) {
      scores.professional += value;
      counts.professional++;
    }
    // Questions 16-20: Emotional zone
    else if (qid >= 16 && qid <= 20) {
      scores.emotional += value;
      counts.emotional++;
    }
    // Question 21: Intensity preference
    else if (qid === 21) {
      intensityPreference = answer.value as string;
    }
    // Question 22: Change style
    else if (qid === 22) {
      changeStyle = answer.value as string;
    }
    // Question 23: Time of day (not stored yet, could be added to profile later)
  });

  // Calculate average scores (normalize to 0-10 scale)
  const socialScore = counts.social > 0 ? Math.round((scores.social / counts.social) * 10) / 10 : 0;
  const physicalScore = counts.physical > 0 ? Math.round((scores.physical / counts.physical) * 10) / 10 : 0;
  const professionalScore = counts.professional > 0 ? Math.round((scores.professional / counts.professional) * 10) / 10 : 0;
  const emotionalScore = counts.emotional > 0 ? Math.round((scores.emotional / counts.emotional) * 10) / 10 : 0;

  // Determine primary and secondary zones
  const zoneScores = [
    { zone: 'social', score: socialScore },
    { zone: 'physical', score: physicalScore },
    { zone: 'professional', score: professionalScore },
    { zone: 'emotional', score: emotionalScore },
  ].sort((a, b) => b.score - a.score);

  return {
    socialScore,
    physicalScore,
    professionalScore,
    emotionalScore,
    primaryZone: zoneScores[0].zone,
    secondaryZone: zoneScores[1].zone,
    intensityPreference,
    changeStyle,
  };
}

/**
 * POST /api/assessment/submit
 * Submit assessment answers and create/update avoidance profile
 */
export const submitAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { answers } = req.body as AssessmentSubmission;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Invalid assessment data' });
    }

    // Calculate scores from answers
    const scores = calculateScores(answers);

    // Upsert avoidance profile
    const query = `
      INSERT INTO avoidance_profiles (
        user_id,
        social_score,
        physical_score,
        professional_score,
        emotional_score,
        primary_zone,
        secondary_zone,
        intensity_preference,
        change_style,
        assessed_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        social_score = EXCLUDED.social_score,
        physical_score = EXCLUDED.physical_score,
        professional_score = EXCLUDED.professional_score,
        emotional_score = EXCLUDED.emotional_score,
        primary_zone = EXCLUDED.primary_zone,
        secondary_zone = EXCLUDED.secondary_zone,
        intensity_preference = EXCLUDED.intensity_preference,
        change_style = EXCLUDED.change_style,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      scores.socialScore,
      scores.physicalScore,
      scores.professionalScore,
      scores.emotionalScore,
      scores.primaryZone,
      scores.secondaryZone,
      scores.intensityPreference,
      scores.changeStyle,
    ]);

    const profile = result.rows[0];

    res.status(200).json({
      profile: {
        socialScore: parseFloat(profile.social_score),
        physicalScore: parseFloat(profile.physical_score),
        professionalScore: parseFloat(profile.professional_score),
        emotionalScore: parseFloat(profile.emotional_score),
        primaryZone: profile.primary_zone,
        secondaryZone: profile.secondary_zone,
        intensityPreference: profile.intensity_preference,
        changeStyle: profile.change_style,
        assessedAt: profile.assessed_at,
      },
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
};

/**
 * GET /api/assessment/profile
 * Get user's avoidance profile
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = 'SELECT * FROM avoidance_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = result.rows[0];

    res.status(200).json({
      profile: {
        socialScore: parseFloat(profile.social_score),
        physicalScore: parseFloat(profile.physical_score),
        professionalScore: parseFloat(profile.professional_score),
        emotionalScore: parseFloat(profile.emotional_score),
        primaryZone: profile.primary_zone,
        secondaryZone: profile.secondary_zone,
        intensityPreference: profile.intensity_preference,
        changeStyle: profile.change_style,
        assessedAt: profile.assessed_at,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
