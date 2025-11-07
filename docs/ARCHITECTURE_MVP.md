# MOMENTUM APP - MVP ARCHITECTURE

**Last Updated:** 2025-11-06
**Status:** Production-Ready (Post-Hardening)

---

## SYSTEM OVERVIEW

The Momentum App is a habit formation platform that uses **identity-based challenges** to expand users' comfort zones across four avoidance zones: social, physical, professional, and emotional.

### Core Philosophy
- **Identity over action:** "You're someone who..." vs. "Do this task"
- **Compassionate over punitive:** Recovery messaging, not guilt
- **Research-backed:** Every decision validated by behavioral science
- **MVP-focused:** Ship core loop, postpone complexity

---

## ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOMENTUM APP MVP                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐        ┌──────────────┐                      │
│  │   Frontend   │◄──────►│   Backend    │                      │
│  │  (Next.js)   │  HTTP  │  (Node/TS)   │                      │
│  │   Port 3000  │        │  Port 3001   │                      │
│  └──────────────┘        └───────┬──────┘                      │
│                                   │                              │
│                          ┌────────▼────────┐                    │
│                          │   PostgreSQL    │                    │
│                          │    Port 5432    │                    │
│                          └─────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SYSTEMS RUNNING (MVP)

### 1. Frontend Web (Next.js 14)
- **Path:** `/frontend-web`
- **Port:** 3000
- **Purpose:** User-facing application
- **Key Features:**
  - Landing page with A/B testing
  - User authentication (login/register)
  - 12-question assessment (<2 min)
  - Daily challenge display
  - Text-only evidence submission
  - Post-completion celebration screen
  - Range Map progress visualization
  - Missed challenge recovery banner

### 2. Backend API (Node.js + Express)
- **Path:** `/backend`
- **Port:** 3001
- **Purpose:** Business logic and data management
- **Key Services:**
  - Enhanced challenge selection algorithm (85/60 rule)
  - Identity messaging generation
  - Missed challenge detection
  - Notification scheduling
  - Analytics event tracking
  - A/B test variant assignment

### 3. Database (PostgreSQL 14+)
- **Path:** `/database`
- **Port:** 5432
- **Purpose:** Data persistence
- **Schema:**
  - 13 core tables (users, challenges, daily_challenges, streaks, etc.)
  - 8 indexes for performance
  - 3 views for aggregated queries
  - 5 database functions

---

## DATA FLOW (CORE LOOP)

### Daily Challenge Delivery

```
1. Cron Job (8 AM daily)
   └─► Enhanced Algorithm selects challenge for user
       └─► Creates daily_challenges record
           └─► Notification scheduled (23.5hr strategy)

2. User Opens App
   └─► GET /api/challenges/today
       └─► Returns challenge with identity frame
           └─► Frontend displays ChallengeCard

3. User Completes Challenge
   └─► POST /api/challenges/:id/complete
       └─► Validate evidence (20-1000 chars)
           └─► Update streak
               └─► Generate identity message
                   └─► Return completion data
                       └─► Frontend shows ChallengeCompletion screen
```

### Assessment Flow

```
1. New User Registers
   └─► POST /api/auth/register
       └─► Create user record
           └─► Redirect to /onboarding

2. Complete 12-Question Assessment
   └─► POST /api/assessment/submit
       └─► Calculate zone scores (0-10 scale)
           └─► Identify primary/secondary zones
               └─► Create avoidance_profiles record
                   └─► Return personalized results
                       └─► Redirect to /dashboard

3. First Challenge Delivered
   └─► Algorithm uses profile to select challenge
       └─► Starts with low difficulty in primary zone
```

### Missed Challenge Recovery

```
1. Midnight Cron Job
   └─► detectMissedChallenges()
       └─► Find pending challenges from yesterday
           └─► Update status = 'missed'
               └─► Reset streak (unless freeze available)

2. User Opens App Next Day
   └─► GET /api/challenges/missed-stats
       └─► Calculate consecutive misses
           └─► Generate recovery message (compassionate)
               └─► Frontend shows MissedChallengeBanner
                   └─► Offers easier comeback challenge
```

---

## KEY ALGORITHMS

### 1. Enhanced Challenge Selection

**File:** `/backend/src/services/enhancedChallengeAlgorithm.ts`

**Logic:**
```typescript
1. Get user's avoidance profile (primary/secondary zones)
2. Get challenge history (last 5 attempts)
3. Calculate difficulty using 85/60 rule:
   - Success rate >85% → advance difficulty
   - Success rate <60% → reduce difficulty
   - Otherwise maintain
4. Determine target zones:
   - 70% primary zone
   - 20% secondary zone
   - 10% exploration
   - Never same zone consecutive days
5. Filter candidates:
   - Match difficulty level
   - Completed >7 days ago (spacing rule)
   - Active challenges only
6. Score candidates (multi-factor):
   - Zone match: 40 points
   - Recency: 30 points (never > 30+ > 14-30 > 7-14 days)
   - Variety: 25 points (prevents clustering)
   - Momentum: 5 points (recent success pattern)
7. Weighted random selection from top 5
```

**Research Basis:**
- Duolingo's Half-Life Regression (adaptive difficulty)
- Optimal spacing effect (7-14 day intervals)
- Zone prioritization prevents burnout

### 2. Assessment Scoring (12 Questions)

**File:** `/backend/src/data/assessmentQuestions12.ts`

**Logic:**
```typescript
1. 3 questions per zone (social, physical, professional, emotional)
2. Question types:
   - Frequency: "How often did you..." (66%)
   - Recency: "When was the last time..." (25%)
   - Scale: "Rate your comfort 1-10" (8%)
3. Scoring:
   - Frequency/Recency: Predefined scores (0, 3, 6, 10)
   - Scale: Inverted (10 comfort = 1 avoidance)
4. Normalize to 0-10 scale per zone
5. Sort to identify primary/secondary zones
```

**Target:** <2 minute completion, >90% completion rate

### 3. Identity Message Generation

**File:** `/backend/src/services/identityMessaging.ts`

**Logic:**
```typescript
1. Determine user stage:
   - Becoming (1-4 completions): "You're becoming..."
   - Pattern (5-10): "This is a pattern now..."
   - Established (10+): "You're someone who..."
2. Select zone-specific message
3. Tone varies by stage:
   - Building → Validating → Celebrating
4. Process-based praise ("you chose") not person-based
```

**Research Basis:**
- Identity-first language (James Clear, BJ Fogg)
- Progressive identity formation
- Avoids hollow praise

---

## DATABASE SCHEMA (KEY TABLES)

### Core Tables

```sql
users
├─ id (UUID)
├─ email (unique)
├─ password_hash
├─ timezone
├─ created_at
└─ last_login

avoidance_profiles
├─ id (UUID)
├─ user_id (FK → users)
├─ social_score (0-10)
├─ physical_score (0-10)
├─ professional_score (0-10)
├─ emotional_score (0-10)
├─ primary_zone
└─ secondary_zone

challenges
├─ id (UUID)
├─ zone (social/physical/professional/emotional)
├─ difficulty (low/medium-low/medium/medium-high/high)
├─ title
├─ description
├─ estimated_time (minutes)
├─ implementation_trigger
├─ implementation_action
├─ identity_frame
└─ is_active

daily_challenges
├─ id (UUID)
├─ user_id (FK → users)
├─ challenge_id (FK → challenges)
├─ scheduled_for (date)
├─ status (pending/accepted/completed/skipped/missed)
├─ completed_at
├─ evidence_type ('text')
└─ reflection_text

streaks
├─ id (UUID)
├─ user_id (FK → users)
├─ current_streak
├─ longest_streak
├─ freeze_available
└─ last_break_date

analytics_events
├─ id (UUID)
├─ event_type (string)
├─ user_id (optional)
├─ anonymous_id (optional)
├─ properties (JSONB)
└─ created_at
```

---

## API ENDPOINTS (25+)

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login with JWT
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Challenges
- `GET /api/challenges/today` - Get today's challenge
- `POST /api/challenges/:id/accept` - Accept challenge
- `POST /api/challenges/:id/complete` - Submit evidence (text)
- `POST /api/challenges/:id/skip` - Skip challenge
- `GET /api/challenges/history` - Challenge history

### Progress
- `GET /api/progress/streak` - Current/longest streak
- `GET /api/progress/range-map` - Zone expansion data
- `GET /api/progress/stats` - Completion rate, totals
- `GET /api/progress/missed-stats` - Missed challenge data

### Assessment
- `POST /api/assessment/submit` - Submit 12-question assessment
- `GET /api/assessment/results` - Get zone scores

### Analytics
- `POST /api/analytics/events` - Track event
- `POST /api/analytics/ab-assignment` - Track A/B variant
- `POST /api/analytics/conversion` - Track conversion
- `GET /api/kpi/overview` - Core KPIs
- `GET /api/kpi/retention-curve` - Retention data
- `GET /api/kpi/funnel` - Conversion funnel

---

## OUT OF SCOPE (MVP)

### Phase 2 (Weeks 5-12)
- Photo/voice evidence
- Progress charts
- Streak protection (flex days)
- Milestone celebrations

### Phase 3 (Months 4-6)
- Social features (friends, sharing)
- Leaderboards
- Badges/rewards
- Community challenges

### Phase 4 (Month 7+)
- React Native mobile app
- Premium subscription
- 1-on-1 coaching
- B2B/enterprise

### Never Build
- Global competitive leaderboards
- CMS admin panel (seed manually until 50K+ users)
- Complex social network early
- Multiple content types

---

## DEPLOYMENT

### Current Setup
- **Frontend:** Vercel (recommended)
- **Backend:** AWS ECS or Heroku
- **Database:** AWS RDS PostgreSQL
- **Notifications:** Firebase Cloud Messaging
- **Analytics:** PostHog (free tier: 1M events/month)

### Environment Variables
```bash
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_POSTHOG_KEY=...
```

---

## MONITORING & KPIs

### Success Metrics (Weekly Check)

**Retention Cohorts:**
- Day 1: >40% (industry avg: 20%)
- Day 7: >25% (industry avg: 8.5%) ← **PMF Signal**
- Day 30: >15% (industry avg: 4%)

**Engagement:**
- Completion rate: >55%
- Avg streak: >7 days
- Weekly Active Users (WAU): Growing WoW

**Validation Thresholds:**
- Day 7 retention >40% → Product works
- Day 7 retention <25% → Investigate friction
- Completion rate <60% → Adjust algorithm

### Red Flags (Immediate Action)
- Day 1 retention drops >15% suddenly → Bug or onboarding issue
- Day 7 retention <10% → Fundamental PMF problem
- Challenge completion <30% → Too hard/unclear
- Week-over-week WAU decline → Growth engine stalled

---

## SCALING CONSIDERATIONS

### Current Capacity
- **Backend:** Single server handles ~1,000 DAU
- **Database:** Standard PostgreSQL handles ~10,000 users
- **Notifications:** Firebase free tier: 1M messages/month

### When to Scale
- **10,000+ users:** Add read replicas for database
- **50,000+ users:** Horizontal scaling for backend (load balancer)
- **100,000+ users:** Redis caching layer
- **500,000+ users:** Microservices architecture

---

## SECURITY

### Authentication
- JWT tokens (7-day expiration, HS256 algorithm)
- bcrypt password hashing (10 salt rounds)
- Rate limiting on auth endpoints (5 requests/minute)

### Data Protection
- HTTPS only (TLS 1.3)
- SQL injection prevention (parameterized queries)
- XSS protection (helmet.js)
- CSRF tokens for state-changing requests

### Privacy
- No PII in analytics events
- User data encrypted at rest (AWS RDS encryption)
- GDPR-compliant data deletion on request

---

## DEVELOPMENT WORKFLOW

### Local Setup
```bash
# 1. Clone repository
git clone https://github.com/user/momentum-app.git

# 2. Install dependencies
cd backend && npm install
cd ../frontend-web && npm install

# 3. Setup database
createdb momentum
psql momentum < database/schema.sql
psql momentum < database/migrations/005_seed_60_challenges.sql

# 4. Start services
cd backend && npm run dev    # Port 3001
cd frontend-web && npm run dev  # Port 3000
```

### Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend-web && npm test

# E2E tests
npm run test:e2e
```

---

## DOCUMENTATION

### For Developers
- `/docs/SETUP.md` - Local development setup
- `/docs/API_DOCUMENTATION.md` - API endpoint reference
- `/docs/DATABASE_SCHEMA.md` - Database design

### For Product
- `/docs/MVP_FEATURE_ROADMAP.md` - Feature prioritization
- `/docs/CHALLENGE_ALGORITHM_EXPLAINED.md` - Algorithm logic
- `/docs/WEEKLY_LEARNINGS.md` - User research insights

### Research
- `/docs/RESEARCH_*.md` - 9 research documents with citations

---

## NEXT STEPS (Post-MVP)

1. **Week 1-2:** Monitor Day 1, 7 retention obsessively
2. **Week 3-4:** Run A/B tests on assessment, evidence prompts, messaging
3. **Month 2:** User interviews (10-20 users)
4. **Month 3:** Decide Phase 2 features based on data

**Go/No-Go Decision:**
- If Day 7 retention >25% after 4 weeks → Continue to Phase 2
- If Day 7 retention <15% → Pause and diagnose (don't add features)

---

**Document Version:** 1.0
**Last Review:** 2025-11-06
**Next Review:** After first 100 users
