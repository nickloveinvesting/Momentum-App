# Deployment Instructions

## Environment Variables Setup (Vercel Dashboard)

**IMPORTANT:** Environment variables must be set in the Vercel Dashboard, not in vercel.json.

1. Go to [vercel.com](https://vercel.com) → Your Project → Settings → Environment Variables
2. Add the following variables:

| Name | Value | Environments |
|------|-------|--------------|
| NEXT_PUBLIC_API_URL | https://momentum-backend-gamma.vercel.app | Production, Preview, Development |
| NEXT_PUBLIC_ENV | production | Production |
| NEXT_PUBLIC_ENV | preview | Preview |
| NEXT_PUBLIC_ENV | development | Development |

## Local Development

Create `.env.local` in the `frontend-web` directory:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENV=development
```

Then run:
```bash
npm run dev
```

## Troubleshooting

### Build fails with "NEXT_PUBLIC_API_URL is not configured"
- Ensure the environment variable is set in Vercel Dashboard
- Check that it's enabled for the correct environment (Production/Preview/Development)
- Redeploy after adding the variable

### API calls fail with "Backend unreachable"
- Verify NEXT_PUBLIC_API_URL points to the correct backend URL
- Check that the backend is deployed and running
- Test the backend health endpoint: `curl https://momentum-backend-gamma.vercel.app/health`
