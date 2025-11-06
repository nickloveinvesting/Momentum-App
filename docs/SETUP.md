# Setup Guide - Momentum App

Complete setup instructions for local development.

## Prerequisites

- **Node.js:** v18+ (check: `node --version`)
- **PostgreSQL:** v14+ (check: `psql --version`)
- **npm:** v9+ (check: `npm --version`)
- **Git:** Latest version

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd Momentum-App
```

### 2. Install Dependencies

Install all workspace dependencies:

```bash
npm install
```

This installs dependencies for:
- Root workspace
- `/backend`
- `/ai-engine`
- `/frontend-web`
- `/shared`
- `/cms`
- `/gamification`

### 3. Set Up PostgreSQL Database

**Create Database:**

```bash
createdb momentum
```

**Run Schema Migration:**

```bash
psql momentum < database/schema.sql
```

**Seed Challenge Library:**

```bash
cd cms
npm run seed
```

This loads 80 starter challenges (20 per zone).

### 4. Configure Environment Variables

**Backend:**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://localhost:5432/momentum
DATABASE_POOL_MAX=20

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760

# Redis (optional for production)
REDIS_URL=redis://localhost:6379
```

**Frontend:**

```bash
cd ../frontend-web
cp .env.example .env.local
```

Edit `frontend-web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Build Shared Package

The shared package contains types used across all services:

```bash
cd ../shared
npm run build
```

### 6. Start Development Servers

**Option A: Start All Services (Recommended)**

From project root:

```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:3001`
- Frontend Web on `http://localhost:3000`

**Option B: Start Services Individually**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend-web
npm run dev
```

Terminal 3 - AI Engine (if testing standalone):
```bash
cd ai-engine
npm run dev
```

## Verification

### Check Backend

```bash
curl http://localhost:3001/health
```

Expected: `{"status":"ok","database":"connected"}`

### Check Frontend

Open browser: `http://localhost:3000`

Expected: Landing page with "Expand Your Comfort Zone"

### Check Database

```bash
psql momentum -c "SELECT COUNT(*) FROM challenges;"
```

Expected: `80` (or more if you've added challenges)

## Common Issues

### Issue: Database Connection Failed

**Error:** `ECONNREFUSED` or `password authentication failed`

**Solution:**
1. Check PostgreSQL is running: `pg_ctl status`
2. Start PostgreSQL: `pg_ctl start`
3. Verify connection: `psql -d momentum`
4. Check DATABASE_URL in backend/.env

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Issue: Module Not Found

**Error:** `Cannot find module '@momentum/shared'`

**Solution:**
```bash
cd shared
npm run build
cd ..
npm install
```

### Issue: TypeScript Errors

**Error:** Various TS compilation errors

**Solution:**
```bash
# Clean and rebuild
cd backend  # or frontend-web
rm -rf dist node_modules
npm install
npm run build
```

## Development Workflow

### Making Changes

**1. Backend API Changes:**

```bash
cd backend
# Edit files in src/
# Server auto-reloads with ts-node-dev
```

**2. Frontend Changes:**

```bash
cd frontend-web
# Edit files in app/
# Next.js auto-reloads with Fast Refresh
```

**3. Shared Types Changes:**

```bash
cd shared
# Edit src/types.ts or src/constants.ts
npm run build
# Restart backend and frontend to pick up changes
```

**4. Database Schema Changes:**

```bash
# Edit database/schema.sql
# Create migration file: database/migrations/XXX_description.sql
psql momentum < database/migrations/XXX_description.sql
```

**5. Add New Challenges:**

```bash
cd cms
npm run add-challenge
# Follow prompts to add challenge
```

### Running Tests

**Backend:**

```bash
cd backend
npm test
```

**Frontend:**

```bash
cd frontend-web
npm test
```

**AI Engine:**

```bash
cd ai-engine
npm test
```

### Linting & Formatting

**Lint:**

```bash
npm run lint
```

**Format:**

```bash
npm run format
```

## Database Management

### Backup Database

```bash
pg_dump momentum > momentum_backup.sql
```

### Restore Database

```bash
psql momentum < momentum_backup.sql
```

### Reset Database

```bash
dropdb momentum
createdb momentum
psql momentum < database/schema.sql
cd cms && npm run seed
```

### View Challenge Library

```bash
cd cms
npm run list-challenges
npm run list-challenges -- --zone=social
npm run list-challenges -- --difficulty=high
```

## Project Structure

```
Momentum-App/
├── backend/              # Express API server
├── ai-engine/            # Challenge selection & personalization
├── frontend-web/         # Next.js web app
├── mobile/               # React Native (future)
├── database/             # PostgreSQL schema & migrations
├── cms/                  # Challenge management
├── gamification/         # Rewards & progress logic
├── infrastructure/       # Deployment configs
├── shared/               # Shared types & utilities
├── docs/                 # Documentation
└── package.json          # Root workspace config
```

## Next Steps

Once setup is complete:

1. **Create Test User:** Register at http://localhost:3000/register
2. **Complete Assessment:** Fill out onboarding questions
3. **View Daily Challenge:** Check dashboard for personalized challenge
4. **Test Challenge Flow:** Accept → Complete → Submit evidence
5. **Check Progress:** View Range Map and streak

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Troubleshooting

For additional help:
- Check individual component READMEs (`backend/README.md`, etc.)
- Review API documentation: [API.md](./API.md)
- See architecture overview: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Open issue on GitHub: [Issues](https://github.com/momentum-app/issues)

## Environment-Specific Notes

**macOS:**
- PostgreSQL via Homebrew: `brew install postgresql@14`
- Start PostgreSQL: `brew services start postgresql@14`

**Linux:**
- PostgreSQL via apt: `sudo apt install postgresql postgresql-contrib`
- Start PostgreSQL: `sudo systemctl start postgresql`

**Windows:**
- PostgreSQL via installer: https://www.postgresql.org/download/windows/
- Use Git Bash or WSL2 for Unix commands

---

**Estimated Setup Time:** 15-30 minutes

**Questions?** See [FAQ.md](./FAQ.md) or reach out to the team.
