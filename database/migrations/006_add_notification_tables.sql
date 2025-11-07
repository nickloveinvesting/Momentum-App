-- ============================================================================
-- NOTIFICATION SYSTEM TABLES
-- Migration 006: Add notification preferences and scheduled notifications
-- ============================================================================

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  daily_challenge_enabled BOOLEAN NOT NULL DEFAULT true,
  completion_celebration_enabled BOOLEAN NOT NULL DEFAULT true,
  weekly_report_enabled BOOLEAN NOT NULL DEFAULT true,
  missed_challenge_enabled BOOLEAN NOT NULL DEFAULT true,
  preferred_time VARCHAR(5) NOT NULL DEFAULT '08:00', -- HH:MM format
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- Scheduled notifications queue
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT check_notification_type CHECK (
    type IN ('daily_challenge', 'streak_saver', 'completion_celebration', 'weekly_report')
  ),
  CONSTRAINT check_notification_status CHECK (
    status IN ('pending', 'sent', 'failed', 'cancelled')
  )
);

CREATE INDEX idx_scheduled_notifications_user_id ON scheduled_notifications(user_id);
CREATE INDEX idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX idx_scheduled_notifications_status ON scheduled_notifications(status);
CREATE INDEX idx_scheduled_notifications_type ON scheduled_notifications(type);

-- Trigger for updated_at
CREATE TRIGGER update_user_notification_preferences_updated_at
BEFORE UPDATE ON user_notification_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initialize default preferences for existing users
INSERT INTO user_notification_preferences (user_id)
SELECT id FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM user_notification_preferences WHERE user_id = users.id
);

COMMENT ON TABLE user_notification_preferences IS 'User-specific notification preferences and timing';
COMMENT ON TABLE scheduled_notifications IS 'Queue of notifications to be sent via FCM';
