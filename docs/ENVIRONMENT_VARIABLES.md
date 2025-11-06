# Environment Variables Reference

This document lists all environment variables needed for deploying Momentum App.

## Quick Setup Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Backend deployed to Vercel with all env vars
- [ ] Frontend deployed to Vercel with all env vars
- [ ] CORS updated with frontend URL
- [ ] Test login/signup functionality

---

## Backend Environment Variables

These go in **Vercel Dashboard** > **Backend Project** > **Settings** > **Environment Variables**

### Required Variables

| Variable | Description | Example | Where to Get It |
|----------|-------------|---------|-----------------|
| `NODE_ENV` | Environment mode | `production` | Set manually |
| `DATABASE_URL` | Supabase connection string | `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres` | Supabase > Settings > Database > Connection string |
| `JWT_SECRET` | Secret for JWT tokens | `your-super-secret-32-char-min` | Generate securely (see below) |
| `CORS_ORIGIN` | Allowed frontend URLs | `https://your-app.vercel.app` | Your Vercel frontend URL |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `30d` |
| `API_VERSION` | API version prefix | `v1` |
| `LOG_LEVEL` | Logging level | `info` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### Generate JWT_SECRET

Use one of these methods:

**Method 1: Online Generator**
- Visit: https://randomkeygen.com/
- Copy "Fort Knox Password" (256-bit)

**Method 2: OpenSSL (if you have terminal access)**
```bash
openssl rand -base64 32
```

**Method 3: Node.js**
```javascript
require('crypto').randomBytes(32).toString('hex')
```

---

## Frontend Environment Variables

These go in **Vercel Dashboard** > **Frontend Project** > **Settings** > **Environment Variables**

### Required Variables

| Variable | Description | Example | Where to Get It |
|----------|-------------|---------|-----------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://momentum-backend.vercel.app` | Your Vercel backend URL |
| `NEXT_PUBLIC_ENV` | Environment mode | `production` | Set manually |

### Optional but Recommended

| Variable | Description | Example | Where to Get It |
|----------|-------------|---------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` | Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` | Supabase > Settings > API |

### Optional (Analytics & Payments)

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | Mixpanel analytics | Mixpanel dashboard |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics | Google Analytics dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe payments | Stripe dashboard |

---

## Supabase Configuration

### Getting Supabase Credentials

1. Go to your Supabase project: https://app.supabase.com/
2. Click your project
3. Go to **Settings** (gear icon)

#### For DATABASE_URL:
1. Go to **Settings** > **Database**
2. Scroll to "Connection string"
3. Select "URI" tab
4. Copy the string
5. Replace `[YOUR-PASSWORD]` with your database password

#### For SUPABASE_URL and ANON_KEY:
1. Go to **Settings** > **API**
2. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy "Project API keys" > "anon public" → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Local Development Setup

For local development, create these files (they're gitignored):

### `/backend/.env`

```bash
NODE_ENV=development
PORT=3000

# Get from Supabase after setting up project
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Generate locally - doesn't need to match production
JWT_SECRET=local-development-secret-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Allow localhost
CORS_ORIGIN=http://localhost:3001,http://localhost:3000

API_VERSION=v1
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### `/frontend-web/.env.local`

```bash
# Point to local backend
NEXT_PUBLIC_API_URL=http://localhost:3000

# Or point to production backend for testing
# NEXT_PUBLIC_API_URL=https://your-backend.vercel.app

# Get from Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

NEXT_PUBLIC_ENV=development
```

---

## Security Best Practices

### Never Commit These Files:
- `.env`
- `.env.local`
- `.env.production`
- Any file containing actual secrets

### Always Commit These Files:
- `.env.example` (templates with placeholder values)
- `vercel.json` (no secrets here)

### Rotate Secrets If:
- JWT_SECRET is compromised
- Database password is leaked
- Keys are accidentally committed to git

### How to Rotate:
1. Generate new secret
2. Update in Vercel dashboard
3. Redeploy application
4. Old tokens will be invalidated

---

## Troubleshooting

### "Database connection failed"
- ✅ Check DATABASE_URL is correct
- ✅ Verify Supabase project is not paused
- ✅ Check password has no special characters that need escaping
- ✅ Ensure `?sslmode=require` or connection pooling settings are correct

### "CORS error in browser"
- ✅ Check CORS_ORIGIN includes your frontend URL
- ✅ No trailing slash in CORS_ORIGIN
- ✅ Redeploy backend after changing CORS_ORIGIN

### "JWT token invalid"
- ✅ JWT_SECRET must be the same on all backend instances
- ✅ JWT_SECRET changed? All users need to re-login
- ✅ Check token expiration settings

### "Cannot connect to API"
- ✅ NEXT_PUBLIC_API_URL must include https://
- ✅ No trailing slash on API URL
- ✅ Backend is deployed and healthy

---

## Environment Variables Lifecycle

### Development (Local)
```
backend/.env → Used by local backend server
frontend-web/.env.local → Used by local Next.js
```

### Production (Vercel)
```
Vercel Dashboard → Environment Variables → Injected at build/runtime
```

### Updating Production Variables
1. Update in Vercel Dashboard
2. Some variables require rebuild (NEXT_PUBLIC_*)
3. Some are runtime only (DATABASE_URL, JWT_SECRET)
4. **IMPORTANT**: All `NEXT_PUBLIC_*` variables require a rebuild/redeploy

---

## Need to Update a Variable?

### Backend Runtime Variables (no rebuild needed):
- DATABASE_URL
- JWT_SECRET
- CORS_ORIGIN
- LOG_LEVEL

Just update in Vercel dashboard - takes effect immediately on new requests.

### Frontend Build Variables (rebuild required):
- All `NEXT_PUBLIC_*` variables

Update in Vercel dashboard → Go to Deployments → Redeploy latest

---

## Quick Copy-Paste Template

Use this when setting up in Vercel:

```bash
# Backend - Copy and fill in:
NODE_ENV=production
DATABASE_URL=
JWT_SECRET=
CORS_ORIGIN=
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
API_VERSION=v1
LOG_LEVEL=info

# Frontend - Copy and fill in:
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ENV=production
```
