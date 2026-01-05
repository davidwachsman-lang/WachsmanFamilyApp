# Fix 401 Error for auth-callback

The `supabase.functions.config.json` file exists but Supabase might not be recognizing it. Here are steps to fix:

## Step 1: Check Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/hclsegvuijvhlioibnux/functions
2. Click on `auth-callback`
3. Look for **Settings** or **Configuration** tab
4. Find **"JWT Verification"** or **"Require Authentication"**
5. **Turn it OFF** or set to **"false"**
6. Save changes

## Step 2: Alternative - Use Supabase Dashboard to Configure

If the config file isn't working, you might need to:
1. Delete the function in dashboard
2. Redeploy with the config file
3. Or configure it directly in dashboard

## Step 3: Verify Config File Format

The file at `supabase/functions/auth-callback/supabase.functions.config.json` should be:
```json
{
  "auth": false
}
```

## Step 4: Known Issue

There's a known GitHub issue where `"auth": false` doesn't always work:
https://github.com/orgs/supabase/discussions/35118

## Step 5: Workaround - Configure in Dashboard

If config file doesn't work, you MUST configure it in the Supabase Dashboard:
1. Go to your project dashboard
2. Navigate to Edge Functions
3. Select `auth-callback`
4. Look for authentication/JWT settings
5. Disable JWT verification

## Testing

After configuring, test by visiting the callback URL directly:
```
https://hclsegvuijvhlioibnux.supabase.co/functions/v1/auth-callback?code=test&state=test
```

If you still get 401, the dashboard configuration is the only solution.

