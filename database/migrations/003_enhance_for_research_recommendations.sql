-- ============================================================================
-- Migration: Enhance for Research Recommendations
-- Implements features from research docs #2-8
-- ============================================================================

-- ============================================================================
-- 1. ENHANCE USERS TABLE - Add notification preferences and last session
-- ============================================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_session_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS preferred_challenge_time TIME DEFAULT '08:30:00',
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '22:00:00',
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS notification_frequency_cap INT DEFAULT 2; -- max per day

COMMENT ON COLUMN users.last_session_at IS 'Last time user opened app - used for 23.5h notification timing';
COMMENT ON COLUMN users.preferred_challenge_time IS 'User preferred time for daily challenge reminder';
COMMENT ON COLUMN users.notification_frequency_cap IS 'Maximum notifications allowed per day (default: 2)';

-- ============================================================================
-- 2. ENHANCE STREAKS TABLE - Improved Flex Days System
-- ============================================================================

ALTER TABLE streaks
ADD COLUMN IF NOT EXISTS flex_days_available INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS flex_days_max INT DEFAULT 2,
ADD COLUMN IF NOT EXISTS flex_days_earned_total INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS consecutive_completions_for_flex INT DEFAULT 0;

-- Update logic: Earn 1 flex day per 7 consecutive completions
UPDATE streaks SET flex_days_available = 0 WHERE flex_days_available IS NULL;

COMMENT ON COLUMN streaks.flex_days_available IS 'Current flex days held (max 2)';
COMMENT ON COLUMN streaks.flex_days_max IS 'Maximum flex days can hold at once';
COMMENT ON COLUMN streaks.flex_days_earned_total IS 'Lifetime total flex days earned';
COMMENT ON COLUMN streaks.consecutive_completions_for_flex IS 'Track progress toward next flex day (resets at 7)';

-- Remove old freeze columns (superseded by flex_days)
ALTER TABLE streaks
DROP COLUMN IF EXISTS freeze_available,
DROP COLUMN IF EXISTS freeze_used_this_week,
DROP COLUMN IF EXISTS freeze_last_reset;

-- ============================================================================
-- 3. NEW TABLE: Challenge Difficulty Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenge_difficulty_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zone VARCHAR(50) NOT NULL CHECK (zone IN ('social', 'physical', 'professional', 'emotional')),
  current_difficulty_level INT NOT NULL DEFAULT 1 CHECK (current_difficulty_level BETWEEN 1 AND 5),
  total_attempts INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  recent_success_rate DECIMAL(5,2), -- Last 10 challenges success rate
  last_level_change_at TIMESTAMP WITH TIME ZONE,
  sessions_at_current_level INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_zone UNIQUE(user_id, zone)
);

CREATE INDEX idx_difficulty_tracking_user_zone ON challenge_difficulty_tracking(user_id, zone);

COMMENT ON TABLE challenge_difficulty_tracking IS 'Tracks per-zone difficulty calibration using 85/60 thresholds';
COMMENT ON COLUMN challenge_difficulty_tracking.current_difficulty_level IS '1=novice, 2=low-intermediate, 3=intermediate, 4=high-intermediate, 5=advanced';
COMMENT ON COLUMN challenge_difficulty_tracking.recent_success_rate IS 'Success rate of last 10 challenges in this zone';

-- ============================================================================
-- 4. NEW TABLE: SUDS Scale Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS suds_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pre_suds INT CHECK (pre_suds BETWEEN 0 AND 100),
  post_suds INT CHECK (post_suds BETWEEN 0 AND 100),
  suds_delta INT, -- Calculated: pre_suds - post_suds (positive = anxiety reduced)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_suds_per_challenge UNIQUE(daily_challenge_id)
);

CREATE INDEX idx_suds_ratings_user_id ON suds_ratings(user_id);
CREATE INDEX idx_suds_ratings_created_at ON suds_ratings(created_at DESC);

COMMENT ON TABLE suds_ratings IS 'Subjective Units of Distress Scale (0-100) tracked pre/post challenge';
COMMENT ON COLUMN suds_ratings.suds_delta IS 'Anxiety reduction (positive = improvement)';

-- ============================================================================
-- 5. NEW TABLE: Identity Messaging Events
-- ============================================================================

CREATE TABLE IF NOT EXISTS identity_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  daily_challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('completion', 'milestone', 'pattern_recognition', 'weekly_summary')),
  identity_text TEXT NOT NULL, -- e.g., "You're someone who shows up"
  zone VARCHAR(50) CHECK (zone IN ('social', 'physical', 'professional', 'emotional')),
  completions_count INT, -- Number of completions when message was shown
  days_active INT, -- Days since first challenge
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  was_read BOOLEAN DEFAULT false
);

CREATE INDEX idx_identity_messages_user_id ON identity_messages(user_id);
CREATE INDEX idx_identity_messages_shown_at ON identity_messages(shown_at DESC);
CREATE INDEX idx_identity_messages_was_read ON identity_messages(was_read);

COMMENT ON TABLE identity_messages IS 'Tracks identity-based messaging for behavior reinforcement';

-- ============================================================================
-- 6. NEW TABLE: Recovery Messaging Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS recovery_messages_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consecutive_misses INT NOT NULL,
  message_tier VARCHAR(20) NOT NULL CHECK (message_tier IN ('day1_gentle', 'day2_urgent', 'day7_supportive', 'day14_reset')),
  message_sent TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  was_opened BOOLEAN DEFAULT false,
  resulted_in_return BOOLEAN DEFAULT false,
  returned_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_recovery_messages_user_id ON recovery_messages_sent(user_id);
CREATE INDEX idx_recovery_messages_sent_at ON recovery_messages_sent(sent_at DESC);

COMMENT ON TABLE recovery_messages_sent IS 'Tracks "Never Miss Twice" recovery messaging effectiveness';

-- ============================================================================
-- 7. ENHANCE DAILY_CHALLENGES TABLE
-- ============================================================================

ALTER TABLE daily_challenges
ADD COLUMN IF NOT EXISTS difficulty_level INT CHECK (difficulty_level BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS is_comeback_challenge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS evidence_optional BOOLEAN DEFAULT true;

COMMENT ON COLUMN daily_challenges.difficulty_level IS 'Difficulty level at time of delivery (1-5)';
COMMENT ON COLUMN daily_challenges.is_comeback_challenge IS 'True if this is a shortened comeback challenge after misses';
COMMENT ON COLUMN daily_challenges.evidence_optional IS 'Whether evidence is optional (default: true per research)';

-- ============================================================================
-- 8. ENHANCE CHALLENGES TABLE - Add SUDS target
-- ============================================================================

ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS target_suds_min INT CHECK (target_suds_min BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS target_suds_max INT CHECK (target_suds_max BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS difficulty_level INT DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS last_used_for_user JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN challenges.target_suds_min IS 'Minimum SUDS (anxiety) this challenge targets (0-100)';
COMMENT ON COLUMN challenges.target_suds_max IS 'Maximum SUDS (anxiety) this challenge targets (0-100)';
COMMENT ON COLUMN challenges.difficulty_level IS '1=novice, 2=low-intermediate, 3=intermediate, 4=high-intermediate, 5=advanced';
COMMENT ON COLUMN challenges.last_used_for_user IS 'JSONB tracking when challenge was last used per user for spacing';

-- Map existing text difficulty to numeric levels
UPDATE challenges
SET difficulty_level = CASE difficulty
  WHEN 'low' THEN 1
  WHEN 'medium-low' THEN 2
  WHEN 'medium' THEN 3
  WHEN 'medium-high' THEN 4
  WHEN 'high' THEN 5
  ELSE 3
END
WHERE difficulty_level IS NULL;

-- ============================================================================
-- 9. NEW FUNCTIONS: Difficulty Calibration
-- ============================================================================

-- Function: Update difficulty after challenge completion
CREATE OR REPLACE FUNCTION update_difficulty_calibration(
  p_user_id UUID,
  p_zone VARCHAR(50),
  p_completed BOOLEAN
)
RETURNS VOID AS $$
DECLARE
  v_current_level INT;
  v_total_attempts INT;
  v_total_completions INT;
  v_recent_success_rate DECIMAL;
  v_sessions_at_level INT;
BEGIN
  -- Get or create tracking record
  INSERT INTO challenge_difficulty_tracking (user_id, zone)
  VALUES (p_user_id, p_zone)
  ON CONFLICT (user_id, zone) DO NOTHING;

  -- Get current stats
  SELECT current_difficulty_level, total_attempts, total_completions, sessions_at_current_level
  INTO v_current_level, v_total_attempts, v_total_completions, v_sessions_at_level
  FROM challenge_difficulty_tracking
  WHERE user_id = p_user_id AND zone = p_zone;

  -- Update attempt/completion counts
  v_total_attempts := v_total_attempts + 1;
  IF p_completed THEN
    v_total_completions := v_total_completions + 1;
  END IF;
  v_sessions_at_level := v_sessions_at_level + 1;

  -- Calculate recent success rate (last 10 challenges)
  SELECT
    COALESCE(
      COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0) * 100,
      0
    )
  INTO v_recent_success_rate
  FROM (
    SELECT dc.status
    FROM daily_challenges dc
    JOIN challenges c ON dc.challenge_id = c.id
    WHERE dc.user_id = p_user_id
      AND c.zone = p_zone
      AND dc.status IN ('completed', 'skipped', 'missed')
    ORDER BY dc.scheduled_for DESC
    LIMIT 10
  ) recent;

  -- Difficulty adjustment logic with hysteresis
  -- First 3 sessions: Aggressive (±2 levels)
  -- Sessions 4-10: Moderate (±1 level)
  -- Sessions 11+: Standard 85/60 thresholds with hysteresis

  IF v_sessions_at_level <= 3 THEN
    -- Aggressive early calibration
    IF v_recent_success_rate >= 90 AND v_current_level < 5 THEN
      v_current_level := LEAST(v_current_level + 2, 5);
      v_sessions_at_level := 0;
    ELSIF v_recent_success_rate <= 40 AND v_current_level > 1 THEN
      v_current_level := GREATEST(v_current_level - 2, 1);
      v_sessions_at_level := 0;
    END IF;
  ELSIF v_sessions_at_level <= 10 THEN
    -- Moderate calibration
    IF v_recent_success_rate >= 80 AND v_current_level < 5 THEN
      v_current_level := v_current_level + 1;
      v_sessions_at_level := 0;
    ELSIF v_recent_success_rate <= 50 AND v_current_level > 1 THEN
      v_current_level := v_current_level - 1;
      v_sessions_at_level := 0;
    END IF;
  ELSE
    -- Standard thresholds with hysteresis (87% up, 58% down)
    IF v_recent_success_rate >= 87 AND v_current_level < 5 AND v_sessions_at_level >= 5 THEN
      v_current_level := v_current_level + 1;
      v_sessions_at_level := 0;
    ELSIF v_recent_success_rate <= 58 AND v_current_level > 1 AND v_sessions_at_level >= 3 THEN
      v_current_level := v_current_level - 1;
      v_sessions_at_level := 0;
    END IF;
  END IF;

  -- Update tracking
  UPDATE challenge_difficulty_tracking
  SET
    current_difficulty_level = v_current_level,
    total_attempts = v_total_attempts,
    total_completions = v_total_completions,
    recent_success_rate = v_recent_success_rate,
    sessions_at_current_level = v_sessions_at_level,
    last_level_change_at = CASE WHEN v_sessions_at_level = 0 THEN NOW() ELSE last_level_change_at END,
    updated_at = NOW()
  WHERE user_id = p_user_id AND zone = p_zone;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. NEW FUNCTIONS: Flex Days Management
-- ============================================================================

-- Function: Check and award flex days
CREATE OR REPLACE FUNCTION check_and_award_flex_day(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_consecutive INT;
  v_flex_available INT;
  v_flex_max INT;
  v_awarded BOOLEAN := false;
BEGIN
  SELECT consecutive_completions_for_flex, flex_days_available, flex_days_max
  INTO v_consecutive, v_flex_available, v_flex_max
  FROM streaks
  WHERE user_id = p_user_id;

  -- Increment consecutive completions
  v_consecutive := v_consecutive + 1;

  -- Award flex day every 7 consecutive completions (if under max)
  IF v_consecutive >= 7 AND v_flex_available < v_flex_max THEN
    v_flex_available := v_flex_available + 1;
    v_consecutive := 0; -- Reset counter
    v_awarded := true;

    UPDATE streaks
    SET
      flex_days_available = v_flex_available,
      flex_days_earned_total = flex_days_earned_total + 1,
      consecutive_completions_for_flex = v_consecutive,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE streaks
    SET
      consecutive_completions_for_flex = v_consecutive,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  RETURN v_awarded;
END;
$$ LANGUAGE plpgsql;

-- Function: Use flex day (called on miss)
CREATE OR REPLACE FUNCTION use_flex_day_if_available(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_flex_available INT;
  v_used BOOLEAN := false;
BEGIN
  SELECT flex_days_available INTO v_flex_available
  FROM streaks
  WHERE user_id = p_user_id;

  IF v_flex_available > 0 THEN
    UPDATE streaks
    SET
      flex_days_available = flex_days_available - 1,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    v_used := true;
  END IF;

  RETURN v_used;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. SEED DATA: Initialize tracking for existing users
-- ============================================================================

-- Initialize difficulty tracking for all existing users
INSERT INTO challenge_difficulty_tracking (user_id, zone, current_difficulty_level)
SELECT u.id, z.zone, 2 -- Start at level 2 (one below self-assessment default)
FROM users u
CROSS JOIN (
  SELECT unnest(ARRAY['social', 'physical', 'professional', 'emotional']) AS zone
) z
ON CONFLICT (user_id, zone) DO NOTHING;

-- Initialize flex days tracking for existing streak records
UPDATE streaks
SET
  flex_days_available = 0,
  flex_days_max = 2,
  flex_days_earned_total = 0,
  consecutive_completions_for_flex = current_streak % 7
WHERE flex_days_available IS NULL;

-- ============================================================================
-- 12. UPDATED VIEW: Enhanced user stats
-- ============================================================================

CREATE OR REPLACE VIEW user_stats_enhanced AS
SELECT
    u.id AS user_id,
    u.name,
    u.email,
    s.current_streak,
    s.longest_streak,
    s.flex_days_available,
    s.flex_days_earned_total,
    COUNT(dc.id) FILTER (WHERE dc.status = 'completed') AS total_completed,
    COUNT(dc.id) AS total_delivered,
    ROUND(
        COUNT(dc.id) FILTER (WHERE dc.status = 'completed')::NUMERIC /
        NULLIF(COUNT(dc.id), 0) * 100,
        2
    ) AS completion_rate,
    MAX(dc.completed_at) AS last_completed_at,
    COUNT(DISTINCT DATE(dc.completed_at)) FILTER (WHERE dc.status = 'completed' AND dc.completed_at >= CURRENT_DATE - INTERVAL '7 days') AS last_7_days_completions,
    -- Consecutive misses (days since last completion)
    CASE
      WHEN MAX(dc.completed_at) IS NOT NULL THEN
        CURRENT_DATE - DATE(MAX(dc.completed_at))
      ELSE 0
    END AS consecutive_misses,
    -- Average SUDS reduction
    (SELECT AVG(suds_delta) FROM suds_ratings sr WHERE sr.user_id = u.id AND sr.suds_delta IS NOT NULL) AS avg_suds_reduction
FROM users u
LEFT JOIN streaks s ON u.id = s.user_id
LEFT JOIN daily_challenges dc ON u.id = dc.user_id
GROUP BY u.id, u.name, u.email, s.current_streak, s.longest_streak, s.flex_days_available, s.flex_days_earned_total;

COMMENT ON VIEW user_stats_enhanced IS 'Enhanced user statistics including flex days, SUDS, and consecutive misses';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
