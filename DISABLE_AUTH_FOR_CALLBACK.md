# Disable JWT Verification for auth-callback Function

The `auth-callback` function needs to be accessible without authentication because Google's OAuth redirect doesn't include authorization headers.

## Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/hclsegvuijvhlioibnux/functions
2. Click on the `auth-callback` function
3. Look for settings or configuration options
4. Find "JWT Verification" or "Require Authentication" setting
5. Disable it/turn it off
6. Save the changes

## Option 2: Verify Config File

The config file should be at: `supabase/functions/auth-callback/supabase.functions.config.json`

It should contain:
```json
{
  "auth": false
}
```

If the file exists but still doesn't work, try:
1. Delete the function
2. Redeploy with the config file present

## Option 3: Contact Supabase Support

If neither option works, Supabase might have updated their Edge Functions API. Check the latest docs:
https://supabase.com/docs/guides/functions

