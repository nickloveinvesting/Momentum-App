# Quick Deployment Fix - Get Your App Working NOW

**Current Status**: Backend code is fixed and pushed, but Vercel needs to redeploy and you need database credentials.

## Step 1: Redeploy Backend (2 minutes)

### Option A: Via Vercel Dashboard (Easiest)
1. Go to https://vercel.com/dashboard
2. Find your `momentum-backend-gamma` project
3. Click on it
4. Click "Deployments" tab
5. Click the three dots (...) next to the latest deployment
6. Click **"Redeploy"**
7. ✅ Wait ~2-3 minutes for deployment to complete

### Option B: Via Git (Alternative)
1. Push to your main/production branch to trigger auto-deploy
2. Or use Vercel CLI: `cd backend && vercel --prod`

---

## Step 2: Set Up Database (5 minutes)

You have 2 options:

### Option A: Supabase (Free, Recommended)

1. **Create Project**:
   - Go to https://supabase.com
   - Sign up/login
   - Click "New Project"
   - Name: `momentum-db`
   - Database Password: **SAVE THIS!** (example: `MySecurePass123!`)
   - Region: Choose closest to you
   - Click "Create" (wait ~2 min)

2. **Load Schema**:
   - In Supabase, click "SQL Editor"
   - Click "New Query"
   - Copy ALL contents from: `/database/schema.sql`
   - Paste and click "Run"
   - Should see "Success. No rows returned" ✅

3. **Load Challenges Data**:
   - New Query
   - Copy contents from: `/database/migrations/005_seed_60_challenges.sql`
   - Run it
   - Should see "INSERT 0 80" ✅

4. **Get Connection String**:
   - Go to Settings > Database
   - Find "Connection string" > "URI"
   - Copy it (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:6543/postgres`)
   - Replace `[YOUR-PASSWORD]` with the password from step 1
   - **SAVE THIS!**

### Option B: Neon (Free, Fast Alternative)

1. Go to https://neon.tech
2. Create account and new project
3. Copy connection string
4. Load schema using their SQL editor

---

## Step 3: Configure Vercel Environment Variables (2 minutes)

1. Go to https://vercel.com/dashboard
2. Click on `momentum-backend-gamma` project
3. Go to **Settings** > **Environment Variables**
4. Add these variables:

```
DATABASE_URL = postgresql://postgres:[password]@db.xxxxx.supabase.co:6543/postgres
```
*(Use the connection string from Step 2)*

```
JWT_SECRET = 8f7a3e2b9c4d1e5f6a0b8c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f
```
*(Or generate your own 32+ character random string)*

```
CORS_ORIGIN = *
```
*(Allows all origins - you can restrict this later)*

5. Click "Save"
6. **IMPORTANT**: Go back to "Deployments" and **Redeploy** again so it picks up the new env vars

---

## Step 4: Test It! (1 minute)

### Test 1: Health Check
```bash
curl https://momentum-backend-gamma.vercel.app/health
```
Should return: `{"status":"healthy",...}`

### Test 2: Registration
Go to your frontend:
https://momentum-frontend-git-claude-test-fu-a8324c-nick-loves-projects.vercel.app

Try to register:
- Email: `test@example.com`
- Password: `TestPassword123`
- Name: `Test User`

✅ Should work!

### Test 3: Login
Use the same credentials to login.

---

## Credentials To Use After Setup

**You need to REGISTER first** - the database is empty.

Register with:
- Email: `yourname@example.com` (any email)
- Password: `YourPassword123` (min 8 characters)
- Name: `Your Name`

Then login with those same credentials!

---

## Troubleshooting

### "Route not found" error
- ✅ Fixed in latest code
- ❌ Vercel hasn't redeployed - go to Step 1

### "Database connection error"
- ❌ No DATABASE_URL set - go to Step 3
- ❌ Wrong password in connection string - check Step 2

### "CORS policy" error
- ✅ Fixed in latest code
- ❌ Vercel hasn't redeployed - go to Step 1
- ❌ CORS_ORIGIN not set - go to Step 3

### Backend returns 500 error
- Check Vercel deployment logs for errors
- Usually means DATABASE_URL is missing

---

## Quick Commands

**Test backend is working:**
```bash
curl https://momentum-backend-gamma.vercel.app/health
```

**Test registration (after setup):**
```bash
curl -X POST https://momentum-backend-gamma.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password123","name":"Test User"}'
```

---

## Summary Checklist

- [ ] Redeploy backend in Vercel
- [ ] Create Supabase project
- [ ] Load database schema
- [ ] Load challenges data
- [ ] Get DATABASE_URL connection string
- [ ] Generate or use JWT_SECRET
- [ ] Add environment variables to Vercel
- [ ] Redeploy backend again (to pick up env vars)
- [ ] Test registration on frontend
- [ ] Login and start using the app!

---

**Estimated Total Time**: 10-15 minutes

**All code is already fixed and pushed to your branch!** Just need to deploy it.

Let me know when you've completed the steps and I'll help test/troubleshoot!
