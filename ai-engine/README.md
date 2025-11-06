# Momentum App - AI Personalization Engine

This package contains the intelligent personalization engine for the Momentum app's 28-day behavioral change program.

## Overview

The AI engine is responsible for:
- **Assessment Generation**: Creating and scoring the 23-question avoidance profile assessment
- **Challenge Selection**: Intelligently selecting daily challenges based on user profile and progress
- **Implementation Intentions**: Generating "When-Then" triggers to increase completion rates
- **Personalization**: Adapting challenge difficulty, zone focus, and timing to each user

## Behavioral Science Foundation

This engine implements evidence-based behavioral science principles:

1. **Progressive Overload**: Gradually increase challenge difficulty over 28 days
2. **Implementation Intentions**: "When X, then Y" format (proven to 2-3x success rates)
3. **Zone Rotation**: Prevent burnout by rotating between social, physical, professional, and emotional challenges
4. **Self-Efficacy Building**: Start with wins in the primary avoidance zone
5. **Personalization**: Match user's stated preferences (time, difficulty, change style)
6. **Variety**: Prevent habituation through intelligent rotation

## Architecture

```
ai-engine/
├── src/
│   ├── assessment/
│   │   ├── questions.ts      # 23 assessment questions
│   │   └── scoring.ts        # Avoidance profile calculation
│   ├── selection/
│   │   ├── algorithm.ts      # Main challenge selection logic
│   │   ├── scoring.ts        # Personalization scoring
│   │   └── filters.ts        # Challenge filtering
│   ├── intentions/
│   │   └── generator.ts      # Implementation intention generation
│   └── index.ts              # Public API exports
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd ai-engine
npm install
```

## Build

```bash
npm run build
```

## Usage

### 1. Generate Assessment

```typescript
import { generateAssessment } from '@momentum/ai-engine';

// Get all 23 assessment questions
const questions = generateAssessment();

// Present questions to user and collect answers
const answers = [
  { questionId: 'social_01', value: 'Often (6-10 times)' },
  { questionId: 'social_02', value: 'More than 3 months ago' },
  { questionId: 'social_03', value: 8 }, // Scale questions use numbers
  // ... 20 more answers
];
```

### 2. Score Assessment

```typescript
import { scoreAssessment } from '@momentum/ai-engine';

// Calculate avoidance profile from answers
const profile = scoreAssessment(userId, answers);

console.log(profile);
// {
//   userId: 'user-123',
//   socialScore: 7.8,
//   physicalScore: 4.2,
//   professionalScore: 6.5,
//   emotionalScore: 5.1,
//   primaryZone: 'social',
//   secondaryZone: 'professional',
//   intensityPreference: '10min',
//   changeStyle: 'moderate',
//   assessedAt: Date,
//   updatedAt: Date
// }
```

### 3. Select Daily Challenge

```typescript
import { selectDailyChallenge } from '@momentum/ai-engine';

const context = {
  user: { id: 'user-123', email: 'user@example.com', ... },
  profile: profile, // From step 2
  dayNumber: 5, // Day 5 of 28
  completedChallenges: ['challenge-1', 'challenge-2', ...],
  currentTime: new Date()
};

// Get all available challenges from your database
const availableChallenges = await db.challenges.findMany({ isActive: true });

// Get recent challenges for context (last 3-7 days)
const recentChallenges = await db.dailyChallenges.findMany({
  where: { userId: 'user-123' },
  orderBy: { scheduledFor: 'desc' },
  take: 7,
  include: { challenge: true }
});

// Select optimal challenge
const selectedChallenge = selectDailyChallenge(
  context,
  availableChallenges,
  recentChallenges
);

console.log(selectedChallenge);
// Challenge object with zone, difficulty, description, etc.
```

### 4. Generate Implementation Intention

```typescript
import { generateImplementationIntention } from '@momentum/ai-engine';

const intention = generateImplementationIntention(
  selectedChallenge,
  user,
  'morning' // Optional: 'morning' | 'afternoon' | 'evening'
);

console.log(intention);
// {
//   trigger: "When I finish my morning coffee",
//   action: "Text one friend I haven't spoken to in a month."
// }

// Or generate multiple options for user to choose
import { generateIntentionOptions } from '@momentum/ai-engine';

const options = generateIntentionOptions(selectedChallenge, user);
// Returns 3 options with different time-of-day triggers
```

## Challenge Selection Algorithm

### Week-by-Week Strategy

The algorithm adapts challenge selection based on the week:

**Week 1 (Days 1-7): Foundation Building**
- Difficulty: LOW
- Zone Focus: PRIMARY zone (highest avoidance)
- Goal: Build confidence with early wins

**Week 2 (Days 8-14): Expansion**
- Difficulty: MEDIUM-LOW
- Zone Focus: ROTATION (all zones)
- Goal: Introduce variety, prevent zone fatigue

**Week 3 (Days 15-21): Deepening**
- Difficulty: MEDIUM
- Zone Focus: WEIGHTED rotation (based on scores)
- Goal: Deeper challenges across all zones

**Week 4 (Days 22-28): Consolidation**
- Difficulty: MEDIUM-HIGH (or HIGH for aggressive)
- Zone Focus: PRIMARY + SECONDARY
- Goal: Final push on key growth areas

### Personalization Factors

Each challenge is scored (0-100) based on:
1. **Zone Alignment** (30 points): Match to avoidance scores
2. **Difficulty Progression** (25 points): Week-appropriate difficulty
3. **Time Commitment** (15 points): Fits user's stated capacity
4. **Variety** (15 points): Not repeated recently
5. **Strategic Fit** (15 points): Week-specific goals

### Change Styles

Users can choose their progression speed:
- **Gradual**: Slow ramp-up (low → low → medium-low → medium)
- **Moderate**: Standard progression (low → medium-low → medium → medium-high)
- **Aggressive**: Fast ramp-up (low → medium → medium-high → high)

## API Reference

### Assessment Functions

- `generateAssessment()`: Returns all 23 questions
- `scoreAssessment(userId, answers)`: Calculates avoidance profile
- `getQuestionsByZone(zone)`: Get questions for specific zone
- `getZoneScore(profile, zone)`: Get score for specific zone
- `calculateZoneWeights(profile)`: Get selection weights

### Selection Functions

- `selectDailyChallenge(context, challenges, recent)`: Main selection algorithm
- `scoreAndRankChallenges(challenges, profile, day, context)`: Score and rank candidates
- `previewChallengeSequence(context, challenges, days)`: Preview upcoming selections
- `filterByDifficulty(challenges, difficulty)`: Filter by difficulty
- `filterByZone(challenges, zone)`: Filter by zone
- `applyStandardFilters(challenges, options)`: Apply all filters

### Intention Functions

- `generateImplementationIntention(challenge, user, time)`: Generate when-then trigger
- `generateIntentionOptions(challenge, user)`: Generate 3 time-based options
- `recommendTriggerTime(user, history)`: Recommend best time based on patterns
- `validateIntention(intention)`: Validate intention quality
- `generateIntentionReminder(intention, title)`: Create notification text

## Testing

```bash
npm test
```

## Development

```bash
npm run dev  # Watch mode
```

## Integration with Backend

The backend API should call these functions:

```typescript
// In your backend API
import {
  generateAssessment,
  scoreAssessment,
  selectDailyChallenge,
  generateImplementationIntention
} from '@momentum/ai-engine';

// POST /api/assessment - Get questions
app.post('/api/assessment', (req, res) => {
  const questions = generateAssessment();
  res.json({ questions });
});

// POST /api/assessment/submit - Score assessment
app.post('/api/assessment/submit', async (req, res) => {
  const { userId, answers } = req.body;
  const profile = scoreAssessment(userId, answers);

  // Save profile to database
  await db.avoidanceProfile.create({ data: profile });

  res.json({ profile });
});

// POST /api/challenges/daily - Select today's challenge
app.post('/api/challenges/daily', async (req, res) => {
  const userId = req.user.id;

  // Get user data
  const user = await db.user.findUnique({ where: { id: userId } });
  const profile = await db.avoidanceProfile.findUnique({ where: { userId } });
  const completed = await db.dailyChallenge.findMany({
    where: { userId, status: 'completed' },
    select: { challengeId: true }
  });
  const recent = await db.dailyChallenge.findMany({
    where: { userId },
    orderBy: { scheduledFor: 'desc' },
    take: 7,
    include: { challenge: true }
  });

  // Get day number
  const startDate = new Date(user.createdAt);
  const dayNumber = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Get available challenges
  const challenges = await db.challenge.findMany({ where: { isActive: true } });

  // Select challenge
  const selected = selectDailyChallenge(
    {
      user,
      profile,
      dayNumber,
      completedChallenges: completed.map(c => c.challengeId),
      currentTime: new Date()
    },
    challenges,
    recent
  );

  // Generate implementation intention
  const intention = generateImplementationIntention(selected, user);

  // Create daily challenge record
  const dailyChallenge = await db.dailyChallenge.create({
    data: {
      userId,
      challengeId: selected.id,
      scheduledFor: new Date(),
      status: 'pending'
    }
  });

  res.json({
    challenge: selected,
    intention,
    dailyChallenge
  });
});
```

## Behavioral Science References

This engine is based on research from:
- **Implementation Intentions**: Gollwitzer, P. M., & Sheeran, P. (2006)
- **Progressive Overload**: Kahneman & Tversky's Prospect Theory
- **Self-Efficacy**: Bandura, A. (1977)
- **Habit Formation**: Clear, J. (2018) - Atomic Habits
- **Behavioral Activation**: Martell, C. R., et al. (2001)

## Future Enhancements

- [ ] Machine learning for challenge success prediction
- [ ] Dynamic difficulty adjustment based on completion rates
- [ ] Natural language processing for custom implementation intentions
- [ ] Social comparison and community features
- [ ] Adaptive timing based on user patterns
- [ ] Mood tracking integration for emotional zone targeting

## License

MIT
