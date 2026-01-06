# Vercel Environment Variables Setup

Your app is getting a 401 error on Vercel because the environment variables aren't set.

## Required Environment Variables for Vercel

Go to your Vercel project dashboard and add these environment variables:

### 1. Supabase Configuration
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://hclsegvuijvhlioibnux.supabase.co`

- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbHNlZ3Z1aWp2aGxpb2libnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzgwMzYsImV4cCI6MjA4MzExNDAzNn0.khq1D2387gt07-KEAElYp5e_bjI5Kwbj-ubl_dLycLE`

## Steps to Add Environment Variables in Vercel:

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable above
6. Make sure to select **Production**, **Preview**, and **Development** for each variable
7. Click **Save**
8. **Redeploy** your project (or push another commit to trigger redeploy)

## After Adding Variables:

1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic redeploy

The 401 error should be fixed after the environment variables are set and the app is redeployed.


