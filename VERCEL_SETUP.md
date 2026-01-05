# Vercel Environment Variables Setup

## Required Environment Variables

When deploying to Vercel, you **must** add these environment variables in the Vercel dashboard:

### 1. Google OAuth Configuration
- `VITE_GOOGLE_CLIENT_ID` - Your Google OAuth 2.0 Client ID
  - Get this from: [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
  - Example: `571167839412-novb6qntoaonqajuo956tpuoob5crq1g.apps.googleusercontent.com`

- `VITE_GOOGLE_CALENDAR_ID` - Your Google Calendar ID
  - Get this from: Google Calendar → Settings → Integrate calendar
  - Example: `abc123@group.calendar.google.com` or an email address

### 2. Supabase Configuration (if using)
- `VITE_SUPABASE_URL` - Your Supabase project URL
  - Get this from: Supabase Dashboard → Project Settings → API
  - Example: `https://abcdefghijklmnop.supabase.co`

- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key
  - Get this from: Supabase Dashboard → Project Settings → API
  - Look for the "anon" or "public" key

## How to Add Environment Variables in Vercel

### Step-by-Step:

1. **Go to your Vercel project dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your project

2. **Navigate to Settings**
   - Click on the **Settings** tab at the top

3. **Go to Environment Variables**
   - Click on **Environment Variables** in the left sidebar

4. **Add each variable**
   - Click **Add New**
   - Enter the **Key** (e.g., `VITE_GOOGLE_CLIENT_ID`)
   - Enter the **Value** (your actual value)
   - Select the environments where it should be available:
     - ✅ **Production**
     - ✅ **Preview** (recommended)
     - ✅ **Development** (optional, if you use Vercel CLI)
   - Click **Save**
   - Repeat for each variable

5. **Redeploy**
   - After adding all variables, go to the **Deployments** tab
   - Click the three dots (⋮) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger a new deployment

## Important Notes

- ⚠️ **Case sensitive**: Environment variable names are case-sensitive. Make sure they match exactly (e.g., `VITE_GOOGLE_CLIENT_ID` not `vite_google_client_id`)

- ⚠️ **No quotes needed**: Don't add quotes around the values in Vercel - just paste the value directly

- ⚠️ **VITE_ prefix required**: Since this is a Vite app, all environment variables that should be available in the browser must start with `VITE_`

- 🔄 **Redeploy after adding**: After adding/changing environment variables, you need to redeploy for them to take effect

## Verifying Environment Variables

After deployment, you can verify the variables are set correctly:

1. Go to your deployment in Vercel
2. Click on the deployment
3. Go to **Build Logs** - check that the build completed successfully
4. If the app doesn't work, check the browser console for errors about missing variables

## OAuth Redirect URI Update

After deploying to Vercel, **don't forget** to update your Google OAuth settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, add:
   - `https://your-app-name.vercel.app` (your Vercel URL)
5. Under **Authorized redirect URIs**, add:
   - `https://your-app-name.vercel.app` (if needed)
6. Click **Save**

This allows Google OAuth to work on your production domain.

