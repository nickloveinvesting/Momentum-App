# Momentum App

A daily personal growth action app to get out of your comfort zone

## Features

- **Daily Challenges**: Get a new challenge every day to push yourself out of your comfort zone
- **6 Categories**: Social, Physical, Mental, Creative, Professional, and Wellness challenges
- **Progress Tracking**: Track your streaks, points, and level progression
- **Achievements**: Unlock achievements as you complete challenges
- **Gamification**: Earn points and level up as you grow

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Expo CLI (installed globally or use npx)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Project Structure

```
Momentum-App/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with tabs
│   ├── index.tsx          # Home screen
│   ├── challenges.tsx     # All challenges screen
│   └── progress.tsx       # Progress/stats screen
├── src/
│   ├── components/        # Reusable UI components
│   ├── data/             # Challenge and achievement data
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
└── assets/               # Images and fonts

```

## Technologies Used

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Expo Router** - File-based routing
- **AsyncStorage** - Local data persistence
- **date-fns** - Date utilities

## Challenge Categories

1. **Social**: Push yourself to connect with others
2. **Physical**: Try new physical activities and exercises
3. **Mental**: Challenge your mind with new learning
4. **Creative**: Express yourself through creative pursuits
5. **Professional**: Grow your career and skills
6. **Wellness**: Focus on self-care and wellbeing

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build:android
npm run build:ios
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
