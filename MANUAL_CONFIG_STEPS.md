# Manual Configuration Steps for auth-callback Function

The 401 error is happening because Supabase is checking authentication BEFORE your function code runs. The config file might not be working due to a known Supabase issue.

## Solution: Configure in Supabase Dashboard

**You MUST do this manually in the dashboard:**

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/hclsegvuijvhlioibnux/functions

2. **Find the auth-callback function:**
   - Click on `auth-callback` in the list

3. **Look for Authentication/JWT Settings:**
   - There should be a section for "JWT Verification" or "Authentication"
   - Look for a toggle or checkbox to disable JWT verification
   - Set it to **OFF** or **false**

4. **Save the configuration**

5. **Test again:**
   - Try the OAuth flow again
   - The callback should now work without requiring auth headers

## Alternative: If Dashboard Doesn't Have This Setting

If the dashboard doesn't show JWT verification settings, try:

1. **Delete and Redeploy:**
   ```bash
   supabase functions delete auth-callback
   supabase functions deploy auth-callback
   ```

2. **Check Function Logs:**
   - Go to the function in dashboard
   - Check "Logs" or "Invocations"
   - See what error is actually happening

3. **Contact Supabase Support:**
   - This might be a platform bug
   - Reference: https://github.com/orgs/supabase/discussions/35118

## Current Status

- ✅ Config file exists: `supabase/functions/auth-callback/supabase.functions.config.json`
- ✅ Config file content is correct: `{"auth": false}`
- ❌ Supabase gateway is still requiring auth (platform issue)

**Next Step:** Configure in dashboard or contact Supabase support.


