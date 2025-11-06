# Architecture Overview - Momentum App

## System Architecture

Momentum is built as a **modular monorepo** with specialized services working together to deliver personalized daily micro-actions.

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                         │
├─────────────────────┬───────────────────────────────────────────┤
│   Frontend Web      │   Mobile App (React Native)               │
│   (Next.js 14)      │   iOS & Android                           │
│   Port: 3000        │   Expo                                    │
└──────────┬──────────┴────────────────┬──────────────────────────┘
           │                           │
           │  HTTP/REST + WebSocket    │
           │                           │
┌──────────▼───────────────────────────▼──────────────────────────┐
│                    BACKEND API SERVER                           │
│                    (Node.js/Express)                            │
│                    Port: 3001                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │   Auth      │  │  Challenges  │  │    Progress        │    │
│  │  Controller │  │  Controller  │  │    Controller      │    │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬──────────┘    │
│         │                │                     │               │
│  ┌──────▼────────────────▼─────────────────────▼──────────┐   │
│  │               Service Layer                             │   │
│  │  (userService, challengeService, progressService)      │   │
│  └──────┬──────────────────────────────────────────────────┘   │
└─────────┼──────────────────────────────────────────────────────┘
          │
          │
┌─────────▼──────────────────────┐  ┌──────────────────────────┐
│    AI PERSONALIZATION ENGINE   │  │   GAMIFICATION SERVICE   │
│                                │  │                          │
│  • Assessment Scoring          │  │  • Streak Tracking       │
│  • Challenge Selection         │  │  • Range Map Calculation │
│  • Difficulty Progression      │  │  • Reward Distribution   │
│  • Implementation Intentions   │  │  • Territory Reports     │
└────────────────────────────────┘  └──────────────────────────┘
          │
          │
┌─────────▼──────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                          │
│                                                                 │
│  users  │  challenges  │  daily_challenges  │  range_progress  │
│  streaks  │  evidence_entries  │  reward_cards  │  analytics   │
└─────────────────────────────────────────────────────────────────┘
          │
┌─────────▼──────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│                                                                 │
│  • AWS S3 (Evidence Storage)                                   │
│  • Stripe (Payments)                                           │
│  • SendGrid (Email)                                            │
│  • Firebase/SNS (Push Notifications)                           │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Frontend Web Application

**Technology:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS

**Responsibilities:**
- User authentication (login/register)
- Onboarding assessment (23 questions)
- Daily challenge display and interaction
- Evidence submission (photo/screenshot/voice)
- Progress visualization (Range Map)
- Journal entries display

**Key Features:**
- Server-side rendering for SEO
- Client-side state management (Zustand)
- Canvas-based Range Map visualization
- Responsive, mobile-first design
- Real-time updates via API polling

**Pages:**
- `/` - Landing page
- `/login`, `/register` - Authentication
- `/onboarding` - 23-question assessment
- `/dashboard` - Today's challenge overview
- `/challenge/[id]` - Challenge detail & evidence submission
- `/progress` - Range Map & statistics
- `/journal` - Completed challenges & reflections

### 2. Backend API Server

**Technology:** Node.js, Express, TypeScript, PostgreSQL (pg)

**Responsibilities:**
- RESTful API endpoints (25 total)
- JWT authentication
- Database queries
- Business logic orchestration
- File upload handling
- Rate limiting & security

**Architecture Pattern:** MVC (Model-View-Controller)

**Layers:**
```
Routes → Middleware → Controllers → Services → Database
```

**Key Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login with JWT
- `GET /api/challenges/today` - Get personalized daily challenge
- `POST /api/challenges/:id/complete` - Submit evidence
- `GET /api/progress/range-map` - Get range data
- `GET /api/progress/streak` - Get streak status

**Middleware:**
- Authentication (JWT verification)
- Validation (express-validator)
- Error handling (centralized)
- Rate limiting (express-rate-limit)
- Security headers (helmet)

### 3. AI Personalization Engine

**Technology:** TypeScript, Node.js (standalone service)

**Responsibilities:**
- Generate assessment questions
- Score assessment responses → Avoidance Profile
- Select daily challenges based on:
  - User's avoidance profile
  - Day number (progression)
  - Completed challenges (variety)
  - Time of day context
- Generate implementation intentions

**Core Algorithm:**

```typescript
Week 1: PRIMARY zone, LOW difficulty (build confidence)
Week 2: Rotate zones, MEDIUM-LOW difficulty (variety)
Week 3: Weighted rotation, MEDIUM difficulty (comprehensive)
Week 4: PRIMARY zone, MEDIUM-HIGH difficulty (final push)
```

**Personalization Factors:**
- Avoidance scores (0-10 per zone)
- Change style (gradual/moderate/aggressive)
- Time preference (5/10/15 min)
- Recent challenge history
- Completion patterns

**Integration:** Backend imports functions from AI engine

```typescript
import { scoreAssessment, selectDailyChallenge } from '@momentum/ai-engine';
```

### 4. Gamification Service

**Technology:** TypeScript, Node.js

**Responsibilities:**
- **Streaks:** Track current/longest streaks, freeze mechanics
- **Range Map:** Calculate radius expansion per zone
- **Rewards:** Variable reward card distribution (30% chance)
- **Territory Reports:** Weekly summary generation
- **Milestones:** Trigger rewards at 7/14/21/28 days

**Key Functions:**
```typescript
updateStreak(userId, completed)
calculateRangeExpansion(zone, difficulty)
dropRewardCard(userId) // 30% chance
generateTerritoryReport(userId, weekNumber)
```

### 5. Content Management System (CMS)

**Technology:** TypeScript, PostgreSQL

**Responsibilities:**
- Challenge library management (400+ challenges)
- CLI tools for adding/listing challenges
- Challenge validation
- Database seed files

**Components:**
- `database/seeds/challenges.sql` - Initial 80 challenges
- `admin/addChallenge.ts` - Interactive CLI to add challenges
- `admin/listChallenges.ts` - View/filter challenges
- `docs/CHALLENGE_GUIDELINES.md` - Creation guidelines

**Challenge Structure:**
```sql
title, description, zone, difficulty, estimated_time,
implementation_trigger, implementation_action,
identity_frame, meaning_connection, evidence_type
```

### 6. PostgreSQL Database

**Schema:** 12 tables, 8 indexes, 3 views, 5 functions

**Core Tables:**
- `users` - Account & subscription data
- `avoidance_profiles` - Personalization data
- `challenges` - Master library (400+)
- `daily_challenges` - User-specific challenges
- `range_progress` - Daily capability expansion
- `streaks` - Streak tracking & freezes
- `evidence_entries` - Journal reflections
- `reward_cards` - Variable rewards
- `territory_reports` - Weekly summaries

**Performance Optimizations:**
- Composite indexes on frequently queried columns
- Connection pooling (max 20 connections)
- Prepared statements (SQL injection prevention)
- Views for common aggregate queries

### 7. Shared Package

**Technology:** TypeScript

**Purpose:** Single source of truth for types, constants, utilities

**Exports:**
- **Types:** User, Challenge, AvoidanceProfile, RangeMap, etc.
- **Constants:** Zones, difficulties, notification times, etc.
- **Utilities:** Date formatting, zone weighting, validation
- **Validators:** Zod schemas for request validation

**Usage:**
```typescript
import { User, Challenge, CHALLENGE_ZONES } from '@momentum/shared';
```

**Benefits:**
- Type safety across all services
- No duplicate type definitions
- Shared business logic
- Consistent validation

## Data Flow

### User Registration Flow

```
1. User fills registration form (Frontend)
2. POST /api/auth/register (Backend)
3. Hash password with bcrypt
4. Insert into users table (Database)
5. Initialize streak record (Database)
6. Initialize range progress (Database)
7. Generate JWT token
8. Return user + token (Frontend)
9. Store token in localStorage
10. Redirect to /onboarding
```

### Assessment Flow

```
1. User answers 23 questions (Frontend)
2. POST /api/assessment/submit (Backend)
3. Call scoreAssessment() (AI Engine)
4. Calculate avoidance scores per zone
5. Determine primary/secondary zones
6. Insert into avoidance_profiles table (Database)
7. Return profile (Frontend)
8. Redirect to /dashboard
```

### Daily Challenge Delivery Flow

```
1. Cron job runs at 8 AM user's timezone
2. For each user:
   a. Get avoidance profile (Database)
   b. Calculate day number since signup
   c. Get completed challenge IDs (Database)
   d. Fetch candidate challenges (Database)
   e. Call selectDailyChallenge() (AI Engine)
   f. Insert into daily_challenges table
   g. Send push notification
3. User opens app
4. GET /api/challenges/today (Backend)
5. Return challenge + implementation intention (Frontend)
```

### Challenge Completion Flow

```
1. User completes challenge in real world
2. User uploads evidence (photo/screenshot/voice)
3. POST /api/challenges/:id/complete (Backend)
   - Evidence file uploaded to S3
   - Update daily_challenges.status = 'completed'
4. Update streak (Gamification Service)
5. Update range progress (Gamification Service)
6. Check for reward drop (30% chance)
7. Generate reward card if triggered
8. Return completion response (Frontend)
9. Show identity affirmation
10. Update Range Map visualization
```

## Security Architecture

### Authentication

- **JWT Tokens:** Signed with HS256, 7-day expiration
- **Password Hashing:** bcrypt with 10 salt rounds
- **Token Storage:** localStorage (web), secure storage (mobile)
- **Protected Routes:** Middleware verifies JWT on every request

### Authorization

- **User Isolation:** All queries filtered by `user_id`
- **Row-Level Security:** PostgreSQL RLS policies (future)
- **API Rate Limiting:** 100 req/15min general, 5 req/15min auth

### Data Protection

- **Encryption at Rest:** AWS RDS encryption (production)
- **Encryption in Transit:** HTTPS/TLS 1.3 only
- **Input Validation:** express-validator on all endpoints
- **SQL Injection Prevention:** Parameterized queries only
- **XSS Protection:** Helmet.js security headers
- **CSRF Protection:** CSRF tokens on state-changing operations

### File Upload Security

- **Type Validation:** MIME type checking
- **Size Limits:** 10MB photos, 5MB voice notes
- **Virus Scanning:** ClamAV integration (production)
- **Signed URLs:** S3 pre-signed URLs (1-hour expiration)

## Scalability Considerations

### Current Architecture (MVP)

- **Vertical Scaling:** Single server, PostgreSQL primary
- **Concurrent Users:** ~1,000-5,000
- **Database:** Single RDS instance

### Scaling Path (Growth)

**Phase 1: 10K-50K users**
- Add PostgreSQL read replicas
- Implement Redis caching
- CDN for static assets
- Horizontal pod scaling (Kubernetes)

**Phase 2: 50K-500K users**
- Database sharding by user_id
- Event-driven architecture (SQS/SNS)
- Separate AI Engine service (independent scaling)
- ElastiCache for session management

**Phase 3: 500K+ users**
- Multi-region deployment
- DynamoDB for high-write tables (analytics)
- GraphQL Federation (microservices)
- Advanced caching strategies

## Monitoring & Observability

**Metrics:**
- API response times (p50, p95, p99)
- Database query performance
- Error rates by endpoint
- User activity (DAU, MAU, completion rate)

**Tools:**
- **Application Monitoring:** Datadog
- **Error Tracking:** Sentry
- **Logging:** CloudWatch Logs
- **Uptime Monitoring:** UptimeRobot

**Key Alerts:**
- API latency > 500ms
- Error rate > 1%
- Database connection pool > 80%
- Disk usage > 85%

## Deployment Architecture

**Development:**
- Local development (Docker Compose)
- localhost:3001 (backend), localhost:3000 (frontend)

**Staging:**
- AWS ECS (containerized)
- RDS PostgreSQL (separate instance)
- S3 for evidence files
- CloudFront CDN

**Production:**
- Multi-AZ deployment (high availability)
- Auto-scaling based on CPU/memory
- Load balancer (ALB)
- Database backups (daily automated)

## Technology Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend Web | Next.js 14, React 18, TypeScript | User interface |
| Mobile App | React Native, Expo | iOS/Android apps |
| Backend API | Node.js, Express, TypeScript | REST API server |
| Database | PostgreSQL 14+ | Data persistence |
| AI Engine | TypeScript, Node.js | Challenge selection |
| Caching | Redis | Session & query caching |
| File Storage | AWS S3 | Evidence files |
| Notifications | Firebase/SNS | Push notifications |
| Payments | Stripe | Subscriptions |
| Email | SendGrid | Transactional emails |
| Deployment | AWS ECS, Vercel | Container orchestration |
| Monitoring | Datadog, Sentry | Observability |

## Design Patterns

**Backend:**
- MVC (Model-View-Controller)
- Service Layer Pattern
- Repository Pattern (future)
- Dependency Injection (future)

**Frontend:**
- Component Composition
- Container/Presentational Components
- Custom Hooks for logic reuse
- Context API for global state

**Database:**
- Normalized schema (3NF)
- Composite indexes for performance
- Views for complex queries
- Functions for reusable logic

## Future Architecture Enhancements

1. **Event Sourcing:** Track all user actions as events
2. **CQRS:** Separate read/write models for performance
3. **GraphQL:** More flexible API for mobile
4. **Microservices:** Independent services for scaling
5. **Machine Learning:** Predictive challenge selection
6. **Real-time Collaboration:** WebSocket for live features

---

**Last Updated:** 2025-11-06
**Version:** 1.0.0
