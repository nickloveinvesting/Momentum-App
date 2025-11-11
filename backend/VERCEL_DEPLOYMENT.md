# Momentum Backend - Vercel Deployment Guide

## Quick Setup (5 minutes)

### 1. Set Environment Variables in Vercel

Go to: **https://vercel.com/nick-loves-projects/momentum-backend/settings/environment-variables**

Add these environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://postgres.covkjdomhotcrfilegyw.supabase.co:5432/postgres?sslmode=require` | From Supabase Connection String |
| `JWT_SECRET` | `4bba6d15d409d73a2ae21b143d323a8dcafce9728b3b3931b279bba01d55bc6e` | Secure random key |
| `CORS_ORIGIN` | `https://momentum-frontend-ruddy.vercel.app` | Frontend URL |
| `NODE_ENV` | `production` | Production environment |

### 2. Redeploy Backend

1. Go to: **https://vercel.com/nick-loves-projects/momentum-backend/deployments**
2. Find the latest deployment
3. Click the three dots (...) → **Redeploy**
4. Wait for deployment to complete (status should be "READY")

### 3. Verify Deployment

Test the health endpoint:
```bash
curl https://momentum-backend-is406xr19-nick-loves-projects.vercel.app/health
```

Should return:
```json
{"status": "healthy", "uptime": 12345}
```

### 4. Test Registration

Go to frontend: **https://momentum-frontend-ruddy.vercel.app/register**

Try registering with:
- Email: `test@example.com`
- Password: `TestPassword123` (min 8 chars)
- Name: `Test User`

---

## Troubleshooting

### Issue: 404 on `/api/auth/register`

**Cause:** Frontend pointing to wrong backend URL or env vars not set

**Solution:**
1. Check `NEXT_PUBLIC_API_URL` in frontend Vercel settings
2. Verify backend DATABASE_URL is correct
3. Redeploy backend after adding env vars

### Issue: Database Connection Error

**Cause:** DATABASE_URL is incorrect or Supabase project is down

**Solution:**
1. Go to Supabase: **https://covkjdomhotcrfilegyw.supabase.co**
2. Settings → Database → Copy the Connection String (URI)
3. Update `DATABASE_URL` in Vercel
4. Redeploy

### Issue: JWT Errors

**Cause:** JWT_SECRET changed or env var not set

**Solution:**
1. Keep JWT_SECRET consistent across redeployments
2. Verify it's set in Vercel environment variables
3. Redeploy backend

---

## Environment Variables Explained

### DATABASE_URL
- **What:** PostgreSQL connection string from Supabase
- **Format:** `postgresql://user:password@host:port/db`
- **Where to get:** Supabase Project Settings → Database → Connection String

### JWT_SECRET
- **What:** Secret key for signing JWT tokens
- **Length:** 64 characters (hex)
- **Generate:** `openssl rand -hex 32`
- **Important:** Must be the same across all deployments

### CORS_ORIGIN
- **What:** Which frontend URLs can call this backend
- **Value:** Frontend Vercel URL or `*` for development
- **Example:** `https://momentum-frontend-ruddy.vercel.app`

### NODE_ENV
- **What:** Environment mode
- **Value:** `production` for Vercel, `development` for local

---

## Deployment Checklist

- [ ] Database migrated (schema + challenges loaded)
- [ ] All environment variables set in Vercel
- [ ] Backend redeployed
- [ ] `/health` endpoint returns 200
- [ ] Frontend can register new user
- [ ] Frontend can login
- [ ] Challenge displays on dashboard

---

## After Deployment

### Check Logs
Go to: **https://vercel.com/nick-loves-projects/momentum-backend/deployments**
- Click on latest deployment
- View logs for any errors

### Monitor Performance
- Health check endpoint: `/health`
- API metrics available in Vercel dashboard

### Update Frontend if Needed
If backend URL changes:
1. Update `NEXT_PUBLIC_API_URL` in frontend `.env`
2. Redeploy frontend

---

## Common Patterns

### Local Development
```bash
# Set local .env
cp backend/.env.example backend/.env
# Edit backend/.env with local values
DATABASE_URL=postgresql://localhost:5432/momentum
NODE_ENV=development

# Run
npm run dev
```

### Test Production Database Locally
```bash
# Use production DATABASE_URL in local .env
DATABASE_URL=postgresql://postgres:PASSWORD@host.supabase.co:5432/postgres

# Run tests
npm test
```

---

## References

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Project:** https://covkjdomhotcrfilegyw.supabase.co
- **Backend Repo:** https://github.com/nickloveinvesting/Momentum-App/tree/main/backend
- **Frontend Repo:** https://github.com/nickloveinvesting/Momentum-App/tree/main/frontend-web
