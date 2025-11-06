# MOMENTUM

**Action creates clarity. Small wins build identity. Momentum belongs to those who move first.**

A daily micro-action app that delivers ONE personalized 5-15 minute challenge each day designed to expand users' capability ranges through identity-based behavioral change.

## 🎯 Core Philosophy

Built on research from:
- Teresa Amabile's Progress Principle
- BJ Fogg's Tiny Habits
- James Clear's Identity-Based Habits
- Self-Determination Theory (autonomy, competence, relatedness)

## 🏗️ Architecture

This is a monorepo containing:

- **`/backend`** - Core API server (Node.js/Express)
- **`/ai-engine`** - AI personalization & challenge selection
- **`/frontend-web`** - Web application (Next.js/React)
- **`/mobile`** - Mobile apps (React Native)
- **`/database`** - PostgreSQL schema & migrations
- **`/cms`** - Content management system
- **`/gamification`** - Rewards & progress tracking
- **`/infrastructure`** - Deployment configs (AWS/Vercel)
- **`/shared`** - Shared utilities & types
- **`/docs`** - Technical documentation

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev

# Run tests
npm test
```

## 📱 Features

### For Users
- **Daily Challenge:** One personalized action delivered at 8 AM
- **Range Map:** Visual progress tracking across 4 zones (Social, Physical, Professional, Emotional)
- **Evidence Journal:** Photo/voice/text proof of completed challenges
- **Streak System:** Build momentum with daily completions
- **Weekly Territory Report:** See your capability expansion

### Technical Features
- AI-powered personalization based on avoidance patterns
- Real-time progress tracking
- Push notifications & reminders
- Offline-first mobile architecture
- Secure authentication & payment processing

## 🧪 Research-Backed Design

Every feature is grounded in behavioral science:

1. **Identity-First Framing** - "I am X" language for sustained change
2. **Implementation Intentions** - "When X, then Y" triggers
3. **Small Wins with Meaning** - Micro-actions connected to macro-identity
4. **Variable Rewards** - Unexpected rewards drive engagement
5. **Visible Progress** - Range Map shows daily expansion

## 📊 Success Metrics

- **Target Completion Rate:** 65%+ (vs 10-15% industry avg)
- **Week 1 Retention:** 85%+
- **Day 28 Retention:** 60%+
- **Month 2 Renewal:** 70%+

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL
- Redis (caching)
- JWT authentication

**Frontend:**
- Next.js 14
- React 18
- Tailwind CSS
- Canvas/SVG (Range Map)

**Mobile:**
- React Native
- Expo
- Firebase Cloud Messaging

**Infrastructure:**
- AWS (ECS, RDS, S3)
- Vercel (frontend)
- Stripe (payments)
- SendGrid (email)

## 📖 Documentation

See `/docs` for detailed documentation:
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Frontend Guide](./docs/frontend.md)
- [Mobile Setup](./docs/mobile.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

Each component has its own README with setup instructions. See individual directories for details.

## 📄 License

Proprietary - All rights reserved

## 🔗 Links

- [IGNITE Research Foundation](https://ignite.foundation)
- [Product Roadmap](./docs/roadmap.md)
- [Challenge Library](./docs/challenges.md)

---

**Version:** 1.0.0
**Status:** Active Development
**Last Updated:** 2025-11-06
