# Check Dashboard Settings for auth-callback

The 401 error persists. Please verify these settings in the Supabase Dashboard:

## Step 1: Go to Edge Functions

1. Visit: https://supabase.com/dashboard/project/hclsegvuijvhlioibnux/functions
2. Click on `auth-callback` function

## Step 2: Look for These Settings

Check for **ALL** of these settings and disable them if they exist:

1. **"Verify JWT"** - Should be OFF
2. **"Verify JWT with legacy secret"** - You already disabled this, but check if it's still OFF
3. **"Require Authentication"** - Should be OFF
4. **"JWT Verification"** - Should be disabled
5. **"Auth Required"** - Should be false/off

## Step 3: Check Function Details Page

Look for a **Settings** tab or **Configuration** section on the function details page.

## Step 4: Check Project Settings

Sometimes this is set at the project level:
1. Go to: https://supabase.com/dashboard/project/hclsegvuijvhlioibnux/settings/api
2. Look for Edge Function settings
3. Check if there's a global JWT verification setting

## Step 5: Wait for Propagation

After changing settings:
- Wait 1-2 minutes for changes to propagate
- Try the OAuth flow again

## Alternative: Try Redeploying

If settings still don't work, try:
1. Delete the function in dashboard
2. Redeploy: `supabase functions deploy auth-callback`



