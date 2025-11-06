# Deployment Guide - Momentum App

This guide will walk you through deploying your Momentum App to Vercel (frontend + backend) and Supabase (database).

## Overview

- **Frontend**: Next.js app deployed to Vercel
- **Backend**: Express.js API deployed to Vercel
- **Database**: PostgreSQL hosted on Supabase

---

## Part 1: Setting Up Supabase (Database)

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: momentum-app
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier
5. Click "Create new project" (takes ~2 minutes)

### Step 2: Set Up Your Database Schema

1. In your Supabase project dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy the entire contents of `/database/schema.sql` from your repository
4. Paste it into the SQL editor
5. Click "Run" to execute the schema
6. You should see "Success. No rows returned" - this is normal!

### Step 3: Get Your Supabase Credentials

You'll need these for Vercel later:

1. In Supabase dashboard, go to **Project Settings** (gear icon) > **API**
2. Copy and save these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

3. Go to **Project Settings** > **Database**
4. Scroll down to "Connection string" > "URI"
5. Copy the connection string (looks like: `postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres`)
6. Replace `[password]` with your actual database password from Step 1
7. Save this complete DATABASE_URL

---

## Part 2: Deploying Backend to Vercel

### Step 1: Install Vercel CLI (Optional - for CLI deployment)

If you prefer using the web interface, skip to "Step 2: Deploy via Vercel Dashboard"

```bash
npm install -g vercel
vercel login
```

### Step 2: Deploy via Vercel Dashboard (Recommended)

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up or log in (use your GitHub account)
3. Click "Add New..." > "Project"
4. Import your GitHub repository: `nickloveinvesting/Momentum-App`
5. Vercel will detect your monorepo

#### Configure Backend Deployment:

1. **Project Name**: `momentum-backend` (or your choice)
2. **Root Directory**: Click "Edit" and select `backend`
3. **Framework Preset**: Other
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

#### Add Environment Variables:

Click "Environment Variables" and add these (use your Supabase values):

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-NOW
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://your-frontend.vercel.app
API_VERSION=v1
LOG_LEVEL=info
```

**IMPORTANT**:
- Generate a strong JWT_SECRET (at least 32 random characters)
- You'll update CORS_ORIGIN after deploying the frontend

7. Click "Deploy"
8. Wait for deployment to complete (~2 minutes)
9. **Copy your backend URL** (looks like: `https://momentum-backend.vercel.app`)

---

## Part 3: Deploying Frontend to Vercel

### Step 1: Deploy via Vercel Dashboard

1. In Vercel dashboard, click "Add New..." > "Project"
2. Select the same GitHub repository: `nickloveinvesting/Momentum-App`
3. This time, configure for frontend:

#### Configure Frontend Deployment:

1. **Project Name**: `momentum-app` (or your choice)
2. **Root Directory**: Click "Edit" and select `frontend-web`
3. **Framework Preset**: Next.js (should auto-detect)
4. **Build Command**: `npm run build`
5. **Output Directory**: `.next`
6. **Install Command**: `npm install`

#### Add Environment Variables:

```
NEXT_PUBLIC_API_URL=https://momentum-backend.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase
NEXT_PUBLIC_ENV=production
```

**Replace** the values with:
- Your backend URL from Part 2
- Your Supabase Project URL from Part 1
- Your Supabase Anon Key from Part 1

7. Click "Deploy"
8. Wait for deployment (~2 minutes)
9. **Copy your frontend URL** (looks like: `https://momentum-app.vercel.app`)

---

## Part 4: Update CORS Settings

Now that you have your frontend URL, update your backend:

1. Go to Vercel dashboard > Your Backend Project
2. Go to "Settings" > "Environment Variables"
3. Find `CORS_ORIGIN` and click "Edit"
4. Update the value to your frontend URL: `https://momentum-app.vercel.app`
5. Click "Save"
6. Go to "Deployments" tab
7. Click the three dots on the latest deployment > "Redeploy"

---

## Part 5: Verify Everything Works

### Test Database Connection:

1. Open your backend URL: `https://momentum-backend.vercel.app/health`
2. You should see a health check response

### Test Frontend:

1. Open your frontend URL: `https://momentum-app.vercel.app`
2. The app should load
3. Try creating an account or logging in

---

## Sharing Access with Claude Code

Since you're using Claude Code to manage your app, you don't need to give direct access to your Vercel or Supabase accounts. Instead:

### What Claude Code Can Do:

1. **Update Code**: Push changes to GitHub, which auto-deploys to Vercel
2. **Update Configuration**: Modify vercel.json and environment variable templates
3. **Database Migrations**: Create SQL migration files for you to run in Supabase

### What You Need to Do Manually:

1. **Run SQL Migrations**: Copy SQL from Claude Code and paste into Supabase SQL Editor
2. **Update Environment Variables**: Copy values from Claude Code and paste into Vercel dashboard
3. **Monitor Deployments**: Check Vercel dashboard for deployment status

### Environment Variables Update Process:

When Claude Code needs to update environment variables:

1. Claude Code will create/update `.env.example` files with new variables
2. You copy the variable names and values
3. You paste them into Vercel dashboard:
   - Go to Project > Settings > Environment Variables
   - Add or edit the variables
   - Redeploy if needed

---

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main` branch**: Deploys to production
- **Push to other branches**: Creates preview deployments

Since you're using Claude Code:
1. Claude Code makes changes and commits to a branch
2. Push the branch to GitHub
3. Vercel automatically builds and deploys a preview
4. You can test the preview before merging to main

---

## Troubleshooting

### Backend Not Connecting to Database

1. Check Vercel logs: Project > Deployments > Click deployment > "View Function Logs"
2. Verify DATABASE_URL is correct (check for typos)
3. Ensure Supabase project is active (not paused)

### Frontend Can't Reach Backend

1. Check CORS_ORIGIN in backend includes your frontend URL
2. Verify NEXT_PUBLIC_API_URL points to correct backend URL
3. Check browser console for errors

### Database Schema Issues

1. Go to Supabase > SQL Editor
2. Run: `SELECT * FROM users LIMIT 1;`
3. If error, re-run schema.sql file

---

## Next Steps

1. **Set up monitoring**: Enable Vercel Analytics in project settings
2. **Add custom domain**: Vercel Settings > Domains
3. **Set up database backups**: Supabase automatically backs up (check Settings > Database)
4. **Configure alerts**: Set up email notifications in Vercel for deployment failures

---

## Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs (Logs section in dashboard)
3. Ask Claude Code to help debug specific errors
4. Vercel docs: https://vercel.com/docs
5. Supabase docs: https://supabase.com/docs
