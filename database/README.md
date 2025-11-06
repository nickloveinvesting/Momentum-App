# Database Schema - Momentum App

PostgreSQL database schema for the Momentum daily micro-action app.

## Quick Start

```bash
# Create database
createdb momentum

# Run migrations
psql momentum < schema.sql

# Load seed data (challenges)
psql momentum < seeds/challenges.sql
```

## Schema Overview

### Core Tables

**users** - User accounts and authentication
- Primary key: `id` (UUID)
- Unique: `email`
- Tracks subscription status and timezone

**avoidance_profiles** - Personalization data from assessment
- One-to-one with users
- Stores scores for all 4 zones (social, physical, professional, emotional)
- Determines daily challenge selection

**challenges** - Master library (400+ challenges)
- Categorized by zone and difficulty
- Contains implementation intentions
- Identity frames and meaning connections

**daily_challenges** - User-specific challenge delivery
- Links users to challenges on specific dates
- Tracks status (pending → accepted → completed)
- Stores evidence and reflections

### Progress Tracking

**range_progress** - Daily capability range expansion
- Tracks radius for each zone
- Used to render Range Map visualization
- Shows growth over time

**streaks** - Streak mechanics
- Current and longest streaks
- Freeze availability (1 per week)
- Auto-updated on challenge completion

**evidence_entries** - Journal reflections
- Linked to completed challenges
- User reflections on their growth
- Exportable as PDF

### Gamification

**reward_cards** - Variable rewards (30% drop chance)
- Types: insight, stat, encouragement
- Randomly awarded after completions
- Tracks read/unread status

**territory_reports** - Weekly summaries
- Generated every Sunday
- Shows range expansion by zone
- Highlights identity shifts

### Analytics & Subscriptions

**analytics_events** - Product analytics
- Event tracking (completions, skips, etc.)
- JSONB properties for flexibility
- Used for retention analysis

**subscriptions** - Stripe integration
- Links to Stripe customer & subscription IDs
- Tracks billing periods
- Manages trial → premium flow

## Key Indexes

High-performance indexes for common queries:

```sql
-- Fast user lookups
idx_users_email

-- Challenge selection optimization
idx_challenges_zone_difficulty (composite, filtered)

-- Daily challenge retrieval
idx_daily_challenges_user_scheduled (composite)

-- Analytics queries
idx_analytics_events_created_at (DESC)
```

## Views

**user_stats** - Aggregated user metrics
- Completion rate
- Streak data
- Total challenges

**current_ranges** - Latest range for each user
- Current radius per zone
- Used for Range Map rendering

## Functions

**get_user_day_number(user_id)** - Calculate user's day number
```sql
SELECT get_user_day_number('user-uuid-here');
-- Returns: 15 (if user created 15 days ago)
```

**initialize_user_streak(user_id)** - Set up streak tracking for new user

**initialize_user_range(user_id)** - Set up range progress for new user

## Constraints & Validation

- **Check constraints** enforce valid values (zones, difficulties, statuses)
- **Unique constraints** prevent duplicate daily challenges
- **Foreign keys** maintain referential integrity
- **Cascade deletes** clean up user data properly

## Data Retention

- Active users: Indefinite
- Cancelled subscriptions: Anonymized after 90 days
- Evidence files (S3): Auto-delete after 1 year
- Analytics: Aggregated after 2 years

## Migrations

Future migrations should be added to `/database/migrations/` with timestamps:

```
migrations/
  001_initial_schema.sql
  002_add_challenge_tags.sql
  003_optimize_indexes.sql
```

## Backup Strategy

- **Daily**: Automated snapshots (AWS RDS)
- **Weekly**: Full backup to S3
- **Point-in-time recovery**: 7-day window

## Performance Notes

- Use connection pooling (pg-pool)
- Read replicas for analytics queries
- Partition `analytics_events` by month (future optimization)
- Use `EXPLAIN ANALYZE` for query optimization

## Security

- Row-level security (RLS) policies for multi-tenant safety
- Encrypted at rest (AWS KMS)
- No PII in analytics events
- Password hashes use bcrypt (backend handles this)
