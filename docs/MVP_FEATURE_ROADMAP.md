# MOMENTUM APP - MVP FEATURE ROADMAP

**Last Updated:** 2025-11-06
**Status:** Production Hardening Phase
**Current Focus:** Phase 1 (Core Loop MVP)

---

## EXECUTIVE SUMMARY

This document defines the **phased rollout strategy** for the Momentum App, based on comprehensive research into habit app retention, feature complexity trade-offs, and Day 1→Day 7 churn prevention.

**Key Principle:** Ship embarrassingly simple MVP. Optimize Day 7 retention above all else.

**Success Threshold:** >25% Day 7 retention signals product-market fit.

---

## PHASE 1: CORE LOOP MVP (Current Focus)

**Timeline:** Weeks 1-4 (Launch Ready)
**Goal:** Validate core habit formation loop, achieve >25% Day 7 retention
**Target Metric:** Day 7 retention >25%, completion rate >55%

### ✅ Features Included (5 Core Features Only)

1. **User Registration & Login**
   - Email/password authentication
   - JWT token-based sessions
   - Timezone capture for notification timing
   - **Status:** ✅ Implemented

2. **Assessment Questionnaire (12 Questions)**
   - 3 questions per zone (social, physical, professional, emotional)
   - <2 minute completion time
   - Generates personalized avoidance profile
   - **Status:** ⚠️ Needs refinement (currently 23 questions → reduce to 12)

3. **Daily Challenge Delivery**
   - One challenge per day based on algorithm
   - 5-15 minute time commitment
   - Weighted by avoidance zone (70% primary, 20% secondary, 10% exploration)
   - Difficulty calibration (85/60 rule)
   - **Status:** ✅ Implemented (algorithm needs production hardening)

4. **Evidence Submission (TEXT ONLY)**
   - Minimum 20 characters, maximum 1000
   - Simple textarea, real-time validation
   - Optional (encouraged but not required)
   - Auto-save drafts
   - **Status:** ⚠️ Needs implementation (currently supports photo/voice uploads → simplify to text-only)

5. **Basic Progress Tracking**
   - Current streak display
   - Longest streak display
   - Total completions count
   - Range Map visualization (4 zones)
   - **Status:** ✅ Implemented

6. **Daily Reminder Notification**
   - 8 AM primary notification (user's local time)
   - Personalized message with challenge preview
   - One-tap to open challenge
   - **Status:** ⚠️ Needs implementation (notification infrastructure pending)

### ❌ Explicitly Excluded from Phase 1

- **Mobile App** → Postponed to Phase 4
- **Gamification** (badges, rewards, leaderboards) → Postponed to Phase 3
- **Social Features** (friends, sharing, community) → Postponed to Phase 3
- **Multiple Challenges** (more than one per day) → Postponed to Phase 2
- **Photo/Voice Evidence** → Postponed to Phase 2
- **CMS Admin Panel** → Seed challenges manually via SQL
- **Advanced Analytics Dashboard** → Use PostHog free tier
- **Payment Integration** → Free trial only, Phase 4
- **Multiple Intensity Levels** → One challenge per day (5-15 min range)

### Why This Scope?

**Research Findings:**
- **77% drop-off** occurs in first 3 days → Keep it simple
- Simplifying interfaces improves completion rates by **40%**
- **74% of failed startups scaled prematurely** (Startup Genome)
- Duolingo's core retention driver: **streaks** (9M users maintain 1+ year streaks)
- Streaks app won Apple Design Award for **opinionated simplicity** (6 tasks maximum)

**Key Quote from Research:**
> "If you're not a little embarrassed by your MVP, you've over-built it."

---

## PHASE 2: HABIT REINFORCEMENT (Weeks 5-12)

**Prerequisites:**
- ✅ Phase 1 live with >100 active users
- ✅ Day 7 retention >20%
- ✅ Completion rate >40%

**Goal:** Deepen engagement, add variety without overwhelming

### Features to Add

1. **Evidence Rich Media**
   - Photo evidence upload
   - Voice note recording
   - Image compression & S3 storage
   - **Rationale:** Users request after text-only proves limiting

2. **Progress Insights**
   - Weekly Territory Report
   - Zone expansion charts
   - Completion rate by difficulty
   - Pattern recognition ("You complete most challenges in the morning")
   - **Rationale:** Users want to see progress after 2-3 weeks

3. **Challenge Variety**
   - Multiple challenges per day (choose 1 of 3)
   - Difficulty selection (Easy/Medium/Hard)
   - Time-based filtering (5 min vs. 15 min)
   - **Rationale:** Power users request more agency

4. **Streak Protection**
   - Earn 1 Flex Day per 10 consecutive completions
   - Maximum 2 held at once
   - Auto-applies on missed days
   - **Rationale:** Reduces churn by 21% (Duolingo data)

5. **Milestone Celebrations**
   - 7-day streak achievement
   - 30-day streak achievement
   - 100 completions badge
   - **Rationale:** Reinforce identity at key habit checkpoints (Days 7, 21, 30)

**Rollout Strategy:** 10% → 50% → 100% (incremental A/B testing)

---

## PHASE 3: SOCIAL & COMPETITION (Months 4-6)

**Prerequisites:**
- ✅ 10,000+ active users (critical mass for social features)
- ✅ Day 7 retention >25%
- ✅ Users explicitly requesting social features
- ✅ Moderation infrastructure in place

**Goal:** Add social layer without demotivating solo users

### Features to Add

1. **Friend Connections**
   - Send/accept friend requests
   - See friends' completions (private mode available)
   - Encourage friends (not compare/compete)
   - **Rationale:** Supportive social (not competitive) enhances motivation

2. **Small Group Challenges**
   - 2-5 person challenge groups
   - Shared goal (e.g., "All complete 7 days this week")
   - Private by default
   - **Rationale:** Small groups (2-5) work; large leaderboards demotivate

3. **Progress Sharing**
   - Optional social media sharing
   - Generate shareable graphics (weekly report, milestones)
   - Never forced or default-on
   - **Rationale:** User-initiated sharing (not algorithmic pressure)

4. **Reward System**
   - Badges for milestone completions
   - Unlock new challenge categories
   - Purely aesthetic (no competitive ranking)
   - **Rationale:** Avoid overjustification effect (external rewards undermining intrinsic motivation)

**Rollout Strategy:** Invite beta → opt-in beta → full (defaults OFF)

**Warning from Research:**
> "Overjustification effect: External rewards (badges/points) can undermine intrinsic motivation. Shallow gamification creates motivation imbalances."

---

## PHASE 4: MOBILE & MONETIZATION (Month 7+)

**Prerequisites:**
- ✅ 50,000+ users
- ✅ Users explicitly stating value ("life-changing," "I'd pay for this")
- ✅ Day 30 retention >15%
- ✅ Trial conversion >35%

**Goal:** Scale to mobile, introduce sustainable monetization

### Features to Add

1. **React Native Mobile App**
   - iOS & Android
   - Offline-first sync
   - Push notifications (native)
   - Camera integration for evidence
   - **Rationale:** 70% of users prefer mobile for habit tracking

2. **Premium Subscription**
   - Advanced analytics
   - Unlimited challenges per day
   - Priority support
   - Custom challenge creation
   - **Pricing:** $9.99/month or $79.99/year (20% discount)
   - **Rationale:** Users who reach 30+ days show 4-6x higher conversion rates

3. **Coaching Integration**
   - 1-on-1 coaching sessions
   - Group coaching programs
   - Expert-designed challenge packs
   - **Rationale:** High-value users request human support

4. **B2B/Enterprise**
   - Team licenses for corporate wellness
   - Manager dashboard for team progress
   - Custom branding
   - **Rationale:** Opens new revenue stream, validates at-scale usage

**Monetization Philosophy:**
- Free tier remains valuable (core loop never paywalled)
- Premium enhances experience (doesn't gate progress)
- Focus on retention before monetization

---

## DELETED FROM MVP (Don't Build)

These features were considered but **explicitly excluded** to prevent scope creep:

### ❌ CMS Admin Panel
- **Why Excluded:** Premature optimization. Seed 60 challenges via SQL, manually curate until 10K+ users.
- **Alternative:** Use `/cms/admin/addChallenge.ts` CLI tool for manual additions.
- **Reconsider:** Only after 50K+ users and content team hired.

### ❌ Global Leaderboards
- **Why Excluded:** Demotivating for majority (only top 10% feel good). Privacy concerns. Comparison undermines intrinsic motivation.
- **Alternative:** Small group challenges (Phase 3), self-comparison only.
- **Never Build:** Global competitive leaderboards are anti-pattern for this app.

### ❌ Complex Social Network Early
- **Why Excluded:** Empty social features create negative value. Need 10K+ users for critical mass.
- **Alternative:** Focus on solo experience in Phase 1-2, add supportive social in Phase 3.
- **Reconsider:** Only after Day 7 retention >25% and users request it.

### ❌ Multiple Content Types
- **Why Excluded:** Dilutes focus. Text, video, audio, podcast challenges create maintenance burden.
- **Alternative:** Master text-based micro-challenges first.
- **Reconsider:** Only if user research shows demand.

### ❌ Arbitrary Achievement Systems
- **Why Excluded:** Risk of overjustification effect (external rewards undermine intrinsic motivation).
- **Alternative:** Identity-based messaging (Phase 1), milestone celebrations (Phase 2).
- **Reconsider:** Only if designed around **process** (not outcomes) and **identity** (not rewards).

---

## CURRENT STATUS: WHAT EXISTS vs. WHAT NEEDS WORK

### ✅ Already Built & Production-Ready

1. **Backend API:** 25+ endpoints, JWT auth, rate limiting, security hardening
2. **Database Schema:** 13 tables, triggers, views, functions
3. **AI Personalization Engine:** Assessment scoring, challenge selection algorithm
4. **Frontend Pages:** Landing, login, register, onboarding, dashboard, challenge, progress, journal
5. **Challenge Library:** 80 seed challenges (extensible to 400+)
6. **Streak System:** Current/longest streak tracking, database schema ready

### ⚠️ Needs Production Hardening

1. **Assessment Questions:** Reduce from 23 → 12 questions (<2 min completion)
2. **Challenge Algorithm:** Implement 85/60 rule, spacing intervals, no-repeat logic
3. **Evidence Submission:** Simplify to text-only (remove photo/voice for MVP)
4. **Identity Reinforcement UX:** Post-completion screen with messaging
5. **Missed Challenge Flow:** Compassionate recovery messaging, "never miss twice" logic
6. **Notification System:** 8 AM daily notification, 23.5-hour strategy
7. **Analytics Infrastructure:** PostHog integration, KPI dashboard
8. **Landing Page:** A/B testing infrastructure, email collection

### ❌ Not Yet Implemented

1. **Push Notifications:** Firebase/SNS integration pending
2. **Cron Jobs:** Daily challenge delivery job (8 AM)
3. **Gamification Service:** Reward cards, territory reports (schema ready, service pending)
4. **Email Service:** SendGrid for transactional emails
5. **File Storage:** S3 for evidence uploads (Phase 2)
6. **Payment Integration:** Stripe webhooks (Phase 4)

---

## RISK MITIGATION

### Top Risks Identified from Research

1. **Over-scoped MVP (10+ features)**
   - **Mitigation:** Ship only 5 core features, postpone everything else
   - **Validation:** If Day 7 retention <20%, simplify further (not add features)

2. **Feature bloat over time**
   - **Mitigation:** Use Impact/Effort matrix ruthlessly, require user research before new features
   - **Validation:** Every feature must improve Day 7 or Day 30 retention

3. **Premature gamification (overjustification effect)**
   - **Mitigation:** No badges/leaderboards until Phase 3, focus on identity-based messaging
   - **Validation:** A/B test external rewards vs. identity language

4. **Early social features (empty = negative value)**
   - **Mitigation:** Wait for 10K+ users before any social features
   - **Validation:** Run beta with 1K users, measure engagement before full rollout

5. **Complex onboarding (>7 steps)**
   - **Mitigation:** 12-question assessment, <2 min to first challenge
   - **Validation:** Track assessment completion rate (target >90%)

6. **Monetization before retention**
   - **Mitigation:** Free trial only until Day 30 retention >15%
   - **Validation:** Users vocalize value ("I'd pay for this") before introducing pricing

---

## SUCCESS METRICS BY PHASE

### Phase 1 Success Criteria (MVP)

- **Day 1 Retention:** >30% (industry avg: 20%)
- **Day 7 Retention:** >25% (industry avg: 8.5%, **signals PMF**)
- **Assessment Completion:** >90%
- **Challenge Completion:** >55% (of accepted challenges)
- **Notification Opt-In:** >70%

**Go/No-Go Decision:** If Day 7 retention <15% after 4 weeks, **pause and diagnose** (don't add features).

### Phase 2 Success Criteria

- **Day 30 Retention:** >15% (industry avg: 4%, **5x better**)
- **Weekly Active Users (WAU):** Growing week-over-week
- **Photo Evidence Upload:** >30% of completions use photo
- **Flex Day Usage:** <10% of users (proves it's safety net, not crutch)

### Phase 3 Success Criteria

- **Friend Connections:** >40% of users add at least 1 friend
- **Small Group Participation:** >20% of users join group challenge
- **Badge Earning:** Doesn't decrease intrinsic motivation (A/B test)

### Phase 4 Success Criteria

- **Trial Conversion:** >35% (industry benchmark: 30-45%)
- **LTV:CAC Ratio:** >3:1
- **Churn Rate:** <5% monthly (subscription apps)
- **NPS Score:** >50 (excellent)

---

## KEY PRINCIPLES FOR ALL PHASES

1. **The Two-Week Rule:** No new features in first 2 weeks of any phase—measure and learn
2. **The Duolingo Principle:** Run hundreds of experiments on core retention driver before adding secondary features
3. **The Streaks Constraint:** Opinionated limitations prevent feature bloat
4. **The Overjustification Guard:** External rewards should enhance, not replace, intrinsic motivation
5. **The Critical Mass Test:** Social features need 10K+ active users minimum
6. **The Week 1 Focus:** If users don't see value in 7 days, they never will
7. **The 80/20 Rule:** 80% of retention comes from 20% of features
8. **The Embarrassment Test:** If you're not a little embarrassed by your MVP, you've over-built it

---

## NEXT ACTIONS (Immediate)

### Week 1 Priorities

1. ✅ Reduce assessment from 23 → 12 questions
2. ✅ Simplify evidence submission to text-only
3. ✅ Implement identity reinforcement post-completion screen
4. ✅ Add missed challenge recovery flow with compassionate messaging
5. ✅ Set up notification scheduling (8 AM daily)
6. ✅ Integrate PostHog analytics (free tier)
7. ✅ Deploy landing page with A/B testing
8. ✅ Seed 60 validated challenges (20 per zone × 3 difficulties)

### Week 2-4 Priorities

1. Monitor Day 1, Day 7 retention obsessively
2. Run A/B tests on:
   - Assessment question variations
   - Evidence prompt copy
   - Identity reinforcement messaging
   - Notification timing
3. User interviews (10-20 users)
4. Document learnings in `/docs/WEEKLY_LEARNINGS.md`

---

## REFERENCES

This roadmap is based on comprehensive research documented in:
- `/docs/RESEARCH_mvp_scope.md` - Feature prioritization research
- `/docs/RESEARCH_challenge_algorithms.md` - Algorithm design
- `/docs/RESEARCH_assessment_design.md` - 12-question framework
- `/docs/RESEARCH_identity_reinforcement.md` - Messaging strategy
- `/docs/RESEARCH_evidence_submission.md` - Text-only recommendation
- `/docs/RESEARCH_missed_challenge_recovery.md` - Compassionate recovery
- `/docs/RESEARCH_notification_strategy.md` - Timing and messaging
- `/docs/RESEARCH_analytics_strategy.md` - KPI tracking

---

**Document Status:** Living document, updated as we learn from user behavior.
**Review Cadence:** Weekly during Phase 1, monthly thereafter.
**Owner:** Product team
