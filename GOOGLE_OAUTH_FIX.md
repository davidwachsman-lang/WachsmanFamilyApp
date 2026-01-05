# Fix: Google OAuth redirect_uri_mismatch Error

## The Problem

You're getting `Error 400: redirect_uri_mismatch` because Google OAuth doesn't recognize your Vercel URL as an authorized origin.

## Solution: Update Google OAuth Settings

You need to add your Vercel domain to your Google Cloud Console OAuth configuration.

### Step-by-Step Fix:

1. **Find your Vercel URL**
   - Go to your Vercel dashboard
   - Your app URL will be something like: `https://your-app-name.vercel.app`
   - Or if you have a custom domain: `https://your-custom-domain.com`

2. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Make sure you're in the correct project (the one with your OAuth credentials)

3. **Navigate to OAuth Settings**
   - Click on **APIs & Services** (left sidebar)
   - Click on **Credentials**
   - Find your OAuth 2.0 Client ID (the one you're using for this app)
   - Click on the **Client ID** to edit it

4. **Add Authorized JavaScript origins**
   - Scroll down to **Authorized JavaScript origins**
   - Click **+ ADD URI**
   - Add your Vercel URL: `https://your-app-name.vercel.app`
   - **Don't include a trailing slash**
   - Also add `http://localhost:5173` if it's not already there (for local development)

5. **Add Authorized redirect URIs (if needed)**
   - Scroll down to **Authorized redirect URIs**
   - Google Identity Services typically doesn't need explicit redirect URIs, but if you see errors, add:
     - `https://your-app-name.vercel.app`
   - Keep `http://localhost:5173` for local development

6. **Save the changes**
   - Click **SAVE** at the bottom
   - Wait a few seconds for the changes to propagate

7. **Clear browser cache and try again**
   - The OAuth error might be cached
   - Try clearing your browser cache or using an incognito/private window
   - Or wait 1-2 minutes for the changes to fully propagate

## Example Configuration

Your **Authorized JavaScript origins** should look like:
```
http://localhost:5173
https://your-app-name.vercel.app
```

## Important Notes

- ⚠️ **Use HTTPS**: Vercel uses HTTPS, so make sure your URL starts with `https://`
- ⚠️ **No trailing slash**: Don't add a trailing slash (e.g., use `https://app.vercel.app` not `https://app.vercel.app/`)
- ⚠️ **Wait for propagation**: Changes can take a few seconds to a minute to take effect
- ⚠️ **Multiple environments**: If you have preview deployments, you may need to add those URLs too, or use a wildcard pattern

## If You Have Multiple Vercel Deployments

If you have preview deployments (like `your-app-git-branch-username.vercel.app`), you have two options:

### Option 1: Add each preview URL (tedious)
Add each preview deployment URL as it's created.

### Option 2: Use a wildcard pattern (if Google supports it)
Some configurations allow patterns, but Google OAuth typically requires exact matches.

### Option 3: Use a single production domain
Point all deployments to your main production URL or use a custom domain.

## Testing

After making the changes:
1. Wait 1-2 minutes
2. Clear your browser cache or use an incognito window
3. Try signing in again at your Vercel URL
4. The OAuth popup should now work correctly

## Still Having Issues?

If the error persists:
1. Double-check the exact URL in your browser's address bar matches what you added
2. Make sure you're using HTTPS (not HTTP)
3. Verify you're editing the correct OAuth Client ID
4. Check browser console for more detailed error messages
5. Try a different browser or incognito mode to rule out caching issues

