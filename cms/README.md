# Content Management System - Momentum App

CMS for managing the challenge library that powers daily micro-actions.

## Overview

The CMS provides:
- **Challenge Library:** 400+ pre-built challenges across 4 zones
- **CLI Tools:** Add and list challenges via command line
- **Guidelines:** Research-backed principles for creating effective challenges
- **Database Seeds:** SQL files to populate the challenge library

## Quick Start

```bash
# Install dependencies
cd /home/user/Momentum-App/cms
npm install

# Seed database with initial challenges
npm run seed

# Add a new challenge (interactive)
npm run add-challenge

# List all challenges
npm run list-challenges

# Filter by zone
npm run list-challenges -- --zone=social

# Filter by difficulty
npm run list-challenges -- --difficulty=high

# Combined filters
npm run list-challenges -- --zone=physical --difficulty=medium --limit=20
```

## Challenge Library Structure

### Distribution

**Total Goal:** 400+ challenges

**By Zone (100 each):**
- Social (relationships, communication, vulnerability)
- Physical (body, discomfort, discipline)
- Professional (career, leadership, risk-taking)
- Emotional (feelings, awareness, healing)

**By Difficulty (per zone):**
- LOW: 40 challenges (5-10 min, low risk)
- MEDIUM: 40 challenges (10-15 min, moderate risk)
- HIGH: 20 challenges (15+ min, high risk)

### Current Status

**Seeded:** 80 challenges (20 per zone)
- Social: 20 (8 LOW, 8 MEDIUM, 4 HIGH)
- Physical: 20 (8 LOW, 8 MEDIUM, 4 HIGH)
- Professional: 20 (8 LOW, 8 MEDIUM, 4 HIGH)
- Emotional: 20 (8 LOW, 8 MEDIUM, 4 HIGH)

**Remaining:** 320 challenges to reach 400+

## Directory Structure

```
cms/
├── database/
│   └── seeds/
│       └── challenges.sql        # Initial 80 challenges
├── admin/
│   ├── addChallenge.ts           # CLI: Add new challenge
│   └── listChallenges.ts         # CLI: View challenges
├── docs/
│   └── CHALLENGE_GUIDELINES.md   # Creation guidelines
├── package.json
└── README.md
```

## CLI Tools

### Add Challenge

Interactive CLI that prompts for all challenge fields:

```bash
npm run add-challenge
```

**Fields:**
- Title (short, action-oriented)
- Description (specific instructions)
- Zone (social/physical/professional/emotional)
- Difficulty (low/medium/high)
- Estimated Time (minutes)
- Implementation Trigger ("When X...")
- Implementation Action ("I will Y...")
- Identity Frame ("This is what [identity] does")
- Meaning Connection (why it matters)
- Evidence Type (photo/screenshot/voice/honor)

### List Challenges

View challenges in database with filtering:

```bash
# All challenges (limit 50)
npm run list-challenges

# Social zone only
npm run list-challenges -- --zone=social

# High difficulty only
npm run list-challenges -- --difficulty=high

# Combined: Physical zone, medium difficulty
npm run list-challenges -- --zone=physical --difficulty=medium

# Increase limit
npm run list-challenges -- --limit=200
```

**Output:**
- Grouped by zone and difficulty
- Total counts
- Statistics by zone/difficulty
- Challenge titles and time estimates

## Challenge Design Principles

See [CHALLENGE_GUIDELINES.md](./docs/CHALLENGE_GUIDELINES.md) for comprehensive guidelines.

### Key Principles

**1. Identity-First Framing**
- Use "This is what [identity] does"
- NOT "Good job!" or "You're amazing!"
- Focus on WHO they're becoming, not WHAT they're achieving

**2. Implementation Intentions**
- Every challenge has "When X, then Y" format
- Specific triggers increase success 2-3x

**3. Meaningful Connection**
- Connect micro-action to macro-identity
- Explain WHY this matters for growth

**4. Appropriate Difficulty**
- LOW: 5-10 min, minimal risk
- MEDIUM: 10-15 min, moderate risk
- HIGH: 15+ min, high risk/intensity

**5. Evidence Type**
- PHOTO: Physical actions (workouts, meals)
- SCREENSHOT: Digital actions (texts, posts)
- VOICE: Reflections (emotional processing)
- HONOR: Internal experiences (breathing, emotions)

## Examples

### Social LOW Example

```sql
INSERT INTO challenges (...) VALUES (
  'Text Someone You Miss',
  'Think of one person you haven''t talked to in over a month...',
  'social',
  'low',
  5,
  'When you finish reading this challenge',
  'Open your messages and text that person',
  'This is what people who value authentic relationships do',
  'Every connection you''ve been putting off is courage...',
  'screenshot'
);
```

### Physical MEDIUM Example

```sql
INSERT INTO challenges (...) VALUES (
  '2-Minute Cold Shower',
  'Take a 2-minute fully cold shower...',
  'physical',
  'medium',
  10,
  'When you shower today',
  'Take a 2-minute cold shower',
  'This is what resilient people do',
  'Cold is sensation. Panic is optional...',
  'honor'
);
```

### Professional HIGH Example

```sql
INSERT INTO challenges (...) VALUES (
  'Ask for a Raise',
  'Schedule a conversation with your manager about compensation...',
  'professional',
  'high',
  15,
  'When you schedule with your manager',
  'Request a conversation about compensation',
  'This is what people who advocate for themselves do',
  'Silence about your value trains undervaluation...',
  'screenshot'
);
```

## Database Schema

Challenges are stored in the `challenges` table:

```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  zone VARCHAR(50) NOT NULL,                -- social|physical|professional|emotional
  difficulty VARCHAR(20) NOT NULL,          -- low|medium|high
  estimated_time INT NOT NULL,              -- minutes
  implementation_trigger TEXT NOT NULL,     -- "When X..."
  implementation_action TEXT NOT NULL,      -- "You will Y..."
  identity_frame TEXT NOT NULL,             -- "This is what [identity]..."
  meaning_connection TEXT NOT NULL,         -- Why it matters
  evidence_type VARCHAR(50) NOT NULL,       -- photo|screenshot|voice|honor
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Contributing Challenges

To add challenges to reach 400+:

**Option 1: Use CLI Tool**
```bash
npm run add-challenge
```

**Option 2: Add to SQL File**
Edit `database/seeds/challenges.sql` and add INSERT statements

**Option 3: Direct Database**
```sql
INSERT INTO challenges (...) VALUES (...);
```

### Quality Standards

Every challenge must:
- [ ] Be specific and actionable
- [ ] Include implementation intention (trigger + action)
- [ ] Use identity-first framing
- [ ] Connect to meaningful growth
- [ ] Match difficulty to intensity
- [ ] Have appropriate evidence type
- [ ] Follow guidelines in CHALLENGE_GUIDELINES.md

## Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/momentum
```

## Integration

The backend API (`/home/user/Momentum-App/backend`) queries challenges from this database using:

```typescript
// Get challenges for selection
SELECT * FROM challenges
WHERE zone = $1
  AND difficulty = $2
  AND is_active = true
  AND id NOT IN (SELECT challenge_id FROM daily_challenges WHERE user_id = $3)
ORDER BY RANDOM()
LIMIT 10;
```

The AI Engine (`/home/user/Momentum-App/ai-engine`) scores and selects the best challenge based on user's avoidance profile.

## Roadmap

- [ ] Reach 400+ total challenges
- [ ] Add challenge tagging system (keywords)
- [ ] Create challenge variations (same core idea, different execution)
- [ ] Build web admin interface
- [ ] Add A/B testing for challenge effectiveness
- [ ] Track completion rates by challenge
- [ ] User-submitted challenge review system

## Research Foundation

Challenges are grounded in:
- **Teresa Amabile:** Progress Principle (small wins)
- **BJ Fogg:** Tiny Habits (anchor to behavior)
- **James Clear:** Identity-Based Habits ("I am" > "I want")
- **Gollwitzer & Sheeran:** Implementation Intentions (when-then)
- **Deci & Ryan:** Self-Determination Theory (autonomy, competence, relatedness)

---

**Remember:** Every challenge is a precision intervention in someone's identity. Make it count.
