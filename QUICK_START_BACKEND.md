# Quick Start: Backend OAuth Setup

## Quick Setup Checklist

### 1. Install Supabase CLI
```bash
brew install supabase/tap/supabase
# OR
npm install -g supabase
```

### 2. Login and Link Project
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Set Environment Secrets
```bash
supabase secrets set GOOGLE_CLIENT_ID=your_client_id
supabase secrets set GOOGLE_CLIENT_SECRET=your_client_secret
supabase secrets set GOOGLE_REDIRECT_URI=https://YOUR_PROJECT_REF.supabase.co/functions/v1/auth-callback
supabase secrets set GOOGLE_CALENDAR_ID=your_calendar_id
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Deploy Functions
```bash
supabase functions deploy admin-login
supabase functions deploy auth-callback
supabase functions deploy calendar-events
```

### 5. Create Database Table
Run `supabase-setup-oauth.sql` in Supabase SQL Editor.

### 6. One-Time Authorization
Visit: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/admin-login`

Or use the AdminAuth component in your React app.

### 7. Verify It Works
```bash
curl "https://YOUR_PROJECT_REF.supabase.co/functions/v1/calendar-events"
```

## Environment Variables Summary

### Supabase Edge Functions (secrets):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_CALENDAR_ID`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Vercel/Frontend (.env.local):
- `VITE_SUPABASE_URL`

**Note**: You no longer need `VITE_GOOGLE_CLIENT_ID` in the frontend!

## What Changed

✅ **Backend**: Supabase Edge Functions handle OAuth  
✅ **Frontend**: No more client-side OAuth (removed)  
✅ **API**: Public endpoint `/functions/v1/calendar-events`  
✅ **Storage**: Refresh token in Supabase database  
✅ **Auth**: One-time admin setup only  

## Troubleshooting

**"No stored refresh token"** → Complete Step 6 (authorization)  
**Function deployment fails** → Check `supabase login` and project link  
**CORS errors** → Edge Functions include CORS headers by default  

See `BACKEND_OAUTH_SETUP.md` for detailed instructions.

