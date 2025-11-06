# Momentum Web Frontend

Next.js 14 web application for the Momentum App - a personal growth platform focused on systematic comfort zone expansion.

## Overview

This is the frontend web application built with Next.js 14, TypeScript, Tailwind CSS, and the App Router. It provides a complete user interface for the Momentum experience, from onboarding to daily challenges and progress tracking.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom theme
- **State Management:** Zustand
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **Date Handling:** date-fns

## Features

### Pages

1. **Landing Page** (`/`) - Hero section with value proposition and CTA
2. **Login** (`/login`) - Email/password authentication
3. **Register** (`/register`) - New user signup
4. **Onboarding** (`/onboarding`) - 23-question assessment with progress indicator
5. **Dashboard** (`/dashboard`) - Today's challenge, streak, and stats
6. **Challenge Detail** (`/challenge/[id]`) - Full challenge with evidence submission
7. **Progress** (`/progress`) - Range Map visualization and stats
8. **Journal** (`/journal`) - Completed challenges with reflections

### Components

**UI Components:**
- `Button` - Primary, secondary, outline, ghost, danger variants
- `Input` - Form input with validation and error display
- `ProgressBar` - Multi-step progress indicator

**Domain Components:**
- `ChallengeCard` - Challenge summary with zone colors
- `StreakDisplay` - Current/longest streak with fire indicator
- `EvidenceUpload` - Photo/screenshot/voice/honor evidence
- `RangeMap` - Canvas-based 4-zone expansion visualization

## Getting Started

### Installation

```bash
cd frontend-web
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Design System

### Colors

- **Primary:** Deep blue (#1a365d)
- **Social Zone:** Warm orange (#f97316)
- **Physical Zone:** Energetic green (#22c55e)
- **Professional Zone:** Confident purple (#a855f7)
- **Emotional Zone:** Calming blue (#3b82f6)

### Design Principles

1. Mobile-first responsive
2. Identity-first language
3. Minimal taps to complete actions
4. Clear visual feedback
5. Accessible (ARIA labels)

## File Structure

```
frontend-web/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ChallengeCard.tsx
│   │   ├── StreakDisplay.tsx
│   │   ├── EvidenceUpload.tsx
│   │   └── RangeMap.tsx
│   ├── onboarding/page.tsx
│   ├── dashboard/page.tsx
│   ├── challenge/[id]/page.tsx
│   ├── progress/page.tsx
│   ├── journal/page.tsx
│   └── page.tsx
├── lib/
│   ├── api.ts
│   ├── store.ts
│   └── utils.ts
└── tailwind.config.ts
```

## State Management (Zustand)

```typescript
const { auth, setUser } = useMomentumStore();
const { challenge, setTodayChallenge } = useMomentumStore();
const { progress, setRangeMap, setStreak } = useMomentumStore();
```

## API Integration

All API calls use axios client with JWT authentication:

- `authAPI` - register, login, logout
- `assessmentAPI` - submit assessment, get profile
- `challengeAPI` - get today's challenge, accept, complete
- `progressAPI` - get streak, range map, stats
- `journalAPI` - get entries, export
- `uploadAPI` - upload evidence files

## Type Safety

Uses shared types from `@momentum/shared`:
- User, Challenge, DailyChallenge
- AvoidanceProfile, Streak, RangeMap
- AssessmentAnswer, EvidenceType

---

Built with Next.js 14 | TypeScript | Tailwind CSS
