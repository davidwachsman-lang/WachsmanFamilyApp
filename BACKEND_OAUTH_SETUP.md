# Backend Google Calendar OAuth Setup Guide

This guide will help you set up backend-based Google Calendar OAuth so that calendar events are available to all users without requiring individual logins.

## Architecture Overview

- **Admin authenticates once** with Google OAuth
- **Refresh token is stored** securely in Supabase
- **Backend API** uses refresh token to fetch calendar events
- **Public endpoint** - no authentication required for viewing events

## Prerequisites

1. Supabase project with Edge Functions enabled
2. Google Cloud project with OAuth 2.0 credentials (CLIENT_ID and CLIENT_SECRET)
3. Supabase CLI installed (for deploying Edge Functions)

## Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

## Step 2: Set Up Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- See supabase-setup-oauth.sql for the full script
```

Or manually create the table:

```sql
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
```

## Step 3: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   - `https://{your-project-ref}.supabase.co/functions/v1/auth-callback`
   - (Or your custom domain if you have one)

## Step 4: Deploy Supabase Edge Functions

1. **Initialize Supabase in your project** (if not already done):
   ```bash
   supabase init
   ```

2. **Link to your Supabase project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Set environment secrets** for Edge Functions:
   ```bash
   supabase secrets set GOOGLE_CLIENT_ID=your_client_id_here
   supabase secrets set GOOGLE_CLIENT_SECRET=your_client_secret_here
   supabase secrets set GOOGLE_REDIRECT_URI=https://your-project-ref.supabase.co/functions/v1/auth-callback
   supabase secrets set GOOGLE_CALENDAR_ID=your_calendar_id_here
   supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

   Get your service role key from: Supabase Dashboard → Settings → API → service_role key

4. **Deploy the Edge Functions**:
   ```bash
   supabase functions deploy admin-login
   supabase functions deploy auth-callback
   supabase functions deploy calendar-events
   ```

## Step 5: One-Time Admin Authorization

1. **Start the admin auth flow**:
   - Visit: `https://your-project-ref.supabase.co/functions/v1/admin-login`
   - Or use the AdminAuth React component (see below)

2. **You'll be redirected to Google**:
   - Sign in with your Google account
   - Grant calendar access permissions
   - **Important**: Make sure you see the consent screen (required to get refresh token)

3. **After authorization**:
   - You'll be redirected to the callback URL
   - The refresh token will be displayed and stored in Supabase
   - **Copy the refresh token** and save it (as backup)

4. **Verify the token was stored**:
   ```sql
   SELECT * FROM google_calendar_tokens;
   ```

## Step 6: Update Environment Variables

### For Supabase Edge Functions (already set in Step 4):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_CALENDAR_ID`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### For Vercel (Frontend):
- `VITE_SUPABASE_URL` - Your Supabase project URL

## Step 7: Test the API

Test the calendar events endpoint:

```bash
curl "https://your-project-ref.supabase.co/functions/v1/calendar-events?timeMin=2024-01-01T00:00:00Z&timeMax=2024-01-31T23:59:59Z"
```

You should receive a JSON response with calendar events.

## Step 8: Update React Components

The calendar component now uses the new backend API automatically. No changes needed if you've replaced `googleCalendar.js` with `calendarApi.js`.

## Troubleshooting

### "No stored refresh token" error
- Complete the admin authorization flow (Step 5)
- Verify the token is in the database: `SELECT * FROM google_calendar_tokens;`

### Token refresh fails
- The refresh token may have been revoked
- Re-run the admin authorization flow
- Make sure `prompt: 'consent'` is used (forced in the code)

### Edge Function deployment fails
- Check that you're logged in: `supabase login`
- Verify project link: `supabase projects list`
- Check function logs: `supabase functions logs calendar-events`

### CORS errors
- Edge Functions include CORS headers by default
- If issues persist, check the function code

## Using AdminAuth Component

Add the AdminAuth component to your app for easy one-time setup:

```jsx
import AdminAuth from './components/AdminAuth/AdminAuth'

// In your App.jsx or admin page
<AdminAuth />
```

This provides a button to initiate the OAuth flow.

## Security Notes

- The refresh token is stored securely in Supabase
- Only accessible via service role key (backend only)
- RLS policies prevent public access to the tokens table
- Access tokens are automatically refreshed when expired

## Production Deployment

1. Deploy Edge Functions (Step 4)
2. Complete admin authorization (Step 5)
3. Set Vercel environment variables (Step 6)
4. Deploy frontend to Vercel

## Maintenance

- Refresh tokens don't expire unless revoked
- Access tokens auto-refresh (handled by backend)
- If you need to re-authorize, just run Step 5 again
- The old refresh token will be replaced



