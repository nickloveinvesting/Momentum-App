-- ============================================================================
-- MOMENTUM APP - PostgreSQL Database Schema
-- ============================================================================
-- Research-backed daily micro-action app for expanding capability ranges
-- Built on: Progress Principle, Tiny Habits, Identity-Based Habits, SDT
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_status VARCHAR(50) NOT NULL DEFAULT 'free_trial',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT check_subscription_status CHECK (
    subscription_status IN ('free_trial', 'premium', 'expired', 'cancelled')
  )
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);

-- ============================================================================
-- AVOIDANCE PROFILES
-- ============================================================================

CREATE TABLE avoidance_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  social_score DECIMAL(3,1) NOT NULL CHECK (social_score >= 0 AND social_score <= 10),
  physical_score DECIMAL(3,1) NOT NULL CHECK (physical_score >= 0 AND physical_score <= 10),
  professional_score DECIMAL(3,1) NOT NULL CHECK (professional_score >= 0 AND professional_score <= 10),
  emotional_score DECIMAL(3,1) NOT NULL CHECK (emotional_score >= 0 AND emotional_score <= 10),
  primary_zone VARCHAR(50) NOT NULL,
  secondary_zone VARCHAR(50) NOT NULL,
  intensity_preference VARCHAR(20) NOT NULL DEFAULT '10min',
  change_style VARCHAR(20) NOT NULL DEFAULT 'gradual',
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT check_primary_zone CHECK (
    primary_zone IN ('social', 'physical', 'professional', 'emotional')
  ),
  CONSTRAINT check_secondary_zone CHECK (
    secondary_zone IN ('social', 'physical', 'professional', 'emotional')
  ),
  CONSTRAINT check_intensity_preference CHECK (
    intensity_preference IN ('5min', '10min', '15min')
  ),
  CONSTRAINT check_change_style CHECK (
    change_style IN ('gradual', 'moderate', 'aggressive')
  )
);

CREATE INDEX idx_avoidance_profiles_primary_zone ON avoidance_profiles(primary_zone);

-- ============================================================================
-- CHALLENGES LIBRARY
-- ============================================================================

CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  zone VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  estimated_time INT NOT NULL, -- minutes
  implementation_trigger TEXT NOT NULL,
  implementation_action TEXT NOT NULL,
  identity_frame TEXT NOT NULL,
  meaning_connection TEXT NOT NULL,
  evidence_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,

  CONSTRAINT check_zone CHECK (
    zone IN ('social', 'physical', 'professional', 'emotional')
  ),
  CONSTRAINT check_difficulty CHECK (
    difficulty IN ('low', 'medium-low', 'medium', 'medium-high', 'high')
  ),
  CONSTRAINT check_evidence_type CHECK (
    evidence_type IN ('photo', 'screenshot', 'voice', 'honor', 'text')
  )
);

CREATE INDEX idx_challenges_zone ON challenges(zone);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX idx_challenges_is_active ON challenges(is_active);
CREATE INDEX idx_challenges_zone_difficulty ON challenges(zone, difficulty) WHERE is_active = true;

-- ============================================================================
-- DAILY CHALLENGES (Delivered to Users)
-- ============================================================================

CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id),
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_for DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  evidence_url TEXT,
  evidence_type VARCHAR(50),
  reflection_text TEXT,

  CONSTRAINT check_status CHECK (
    status IN ('pending', 'accepted', 'completed', 'skipped', 'missed')
  ),
  CONSTRAINT unique_user_date UNIQUE(user_id, scheduled_for)
);

CREATE INDEX idx_daily_challenges_user_id ON daily_challenges(user_id);
CREATE INDEX idx_daily_challenges_status ON daily_challenges(status);
CREATE INDEX idx_daily_challenges_scheduled_for ON daily_challenges(scheduled_for);
CREATE INDEX idx_daily_challenges_user_scheduled ON daily_challenges(user_id, scheduled_for);

-- ============================================================================
-- RANGE MAP PROGRESS
-- ============================================================================

CREATE TABLE range_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE NOT NULL,
  social_radius DECIMAL(5,1) NOT NULL DEFAULT 20,
  physical_radius DECIMAL(5,1) NOT NULL DEFAULT 20,
  professional_radius DECIMAL(5,1) NOT NULL DEFAULT 20,
  emotional_radius DECIMAL(5,1) NOT NULL DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_day UNIQUE(user_id, day_number),
  CONSTRAINT unique_user_date UNIQUE(user_id, date)
);

CREATE INDEX idx_range_progress_user_id ON range_progress(user_id);
CREATE INDEX idx_range_progress_date ON range_progress(date);

-- ============================================================================
-- STREAKS
-- ============================================================================

CREATE TABLE streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_completed_date DATE,
  freeze_available BOOLEAN DEFAULT false,
  freeze_used_this_week BOOLEAN DEFAULT false,
  freeze_last_reset DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_streaks_current_streak ON streaks(current_streak);

-- ============================================================================
-- EVIDENCE JOURNAL
-- ============================================================================

CREATE TABLE evidence_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  daily_challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  reflection_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_entry_per_challenge UNIQUE(daily_challenge_id)
);

CREATE INDEX idx_evidence_entries_user_id ON evidence_entries(user_id);
CREATE INDEX idx_evidence_entries_created_at ON evidence_entries(created_at DESC);

-- ============================================================================
-- REWARD CARDS
-- ============================================================================

CREATE TABLE reward_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_type VARCHAR(50) NOT NULL,
  card_content TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false,

  CONSTRAINT check_card_type CHECK (
    card_type IN ('insight', 'stat', 'encouragement')
  )
);

CREATE INDEX idx_reward_cards_user_id ON reward_cards(user_id);
CREATE INDEX idx_reward_cards_is_read ON reward_cards(is_read);

-- ============================================================================
-- WEEKLY TERRITORY REPORTS
-- ============================================================================

CREATE TABLE territory_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  social_expansion DECIMAL(5,1) NOT NULL DEFAULT 0,
  physical_expansion DECIMAL(5,1) NOT NULL DEFAULT 0,
  professional_expansion DECIMAL(5,1) NOT NULL DEFAULT 0,
  emotional_expansion DECIMAL(5,1) NOT NULL DEFAULT 0,
  total_expansion DECIMAL(5,1) NOT NULL DEFAULT 0,
  challenges_completed INT NOT NULL DEFAULT 0,
  total_challenges INT NOT NULL DEFAULT 7,
  photos_submitted INT NOT NULL DEFAULT 0,
  screenshots_submitted INT NOT NULL DEFAULT 0,
  voice_submitted INT NOT NULL DEFAULT 0,
  honor_submitted INT NOT NULL DEFAULT 0,
  identity_shift TEXT,
  next_week_focus VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_week UNIQUE(user_id, week_number)
);

CREATE INDEX idx_territory_reports_user_id ON territory_reports(user_id);
CREATE INDEX idx_territory_reports_week_number ON territory_reports(week_number);

-- ============================================================================
-- ANALYTICS EVENTS
-- ============================================================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event VARCHAR(100) NOT NULL,
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_event ON analytics_events(event);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_properties ON analytics_events USING GIN (properties);

-- ============================================================================
-- SUBSCRIPTIONS (Stripe Integration)
-- ============================================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  plan_type VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT check_status CHECK (
    status IN ('active', 'cancelled', 'past_due', 'incomplete', 'trialing')
  ),
  CONSTRAINT check_plan_type CHECK (
    plan_type IN ('monthly', 'annual', 'trial')
  )
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avoidance_profiles_updated_at BEFORE UPDATE ON avoidance_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate day number for user
CREATE OR REPLACE FUNCTION get_user_day_number(p_user_id UUID)
RETURNS INT AS $$
DECLARE
    v_start_date DATE;
    v_day_number INT;
BEGIN
    SELECT DATE(created_at) INTO v_start_date
    FROM users
    WHERE id = p_user_id;

    v_day_number := CURRENT_DATE - v_start_date + 1;

    RETURN v_day_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: User stats summary
CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id AS user_id,
    u.name,
    u.email,
    s.current_streak,
    s.longest_streak,
    COUNT(dc.id) FILTER (WHERE dc.status = 'completed') AS total_completed,
    COUNT(dc.id) AS total_delivered,
    ROUND(
        COUNT(dc.id) FILTER (WHERE dc.status = 'completed')::NUMERIC /
        NULLIF(COUNT(dc.id), 0) * 100,
        2
    ) AS completion_rate,
    MAX(dc.completed_at) AS last_completed_at
FROM users u
LEFT JOIN streaks s ON u.id = s.user_id
LEFT JOIN daily_challenges dc ON u.id = dc.user_id
GROUP BY u.id, u.name, u.email, s.current_streak, s.longest_streak;

-- View: Current range for all users
CREATE OR REPLACE VIEW current_ranges AS
SELECT
    user_id,
    social_radius,
    physical_radius,
    professional_radius,
    emotional_radius,
    date
FROM range_progress rp1
WHERE day_number = (
    SELECT MAX(day_number)
    FROM range_progress rp2
    WHERE rp2.user_id = rp1.user_id
);

-- ============================================================================
-- SEED DATA FUNCTIONS
-- ============================================================================

-- Function to initialize streak record for new user
CREATE OR REPLACE FUNCTION initialize_user_streak(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO streaks (user_id, current_streak, longest_streak, freeze_available)
    VALUES (p_user_id, 0, 0, false);
END;
$$ LANGUAGE plpgsql;

-- Function to initialize range progress for new user
CREATE OR REPLACE FUNCTION initialize_user_range(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO range_progress (user_id, day_number, date, social_radius, physical_radius, professional_radius, emotional_radius)
    VALUES (p_user_id, 0, CURRENT_DATE, 20, 20, 20, 20);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Core user accounts and authentication';
COMMENT ON TABLE avoidance_profiles IS 'User avoidance patterns from onboarding assessment';
COMMENT ON TABLE challenges IS 'Master library of 400+ challenges';
COMMENT ON TABLE daily_challenges IS 'Challenges delivered to specific users';
COMMENT ON TABLE range_progress IS 'Daily tracking of capability range expansion';
COMMENT ON TABLE streaks IS 'User streak tracking with freeze mechanics';
COMMENT ON TABLE evidence_entries IS 'User reflections on completed challenges';
COMMENT ON TABLE reward_cards IS 'Variable reward drops (insight/stat/encouragement)';
COMMENT ON TABLE territory_reports IS 'Weekly progress summaries';
COMMENT ON TABLE analytics_events IS 'User behavior tracking for product analytics';
COMMENT ON TABLE subscriptions IS 'Stripe subscription management';
