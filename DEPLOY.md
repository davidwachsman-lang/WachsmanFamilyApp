# Deploying the Family Calendar App

## Getting Your App into GitHub

Since you already created a GitHub repo, follow these steps:

### 1. Initialize Git (if not already done)

```bash
git init
```

### 2. Add all files to git

```bash
git add .
```

### 3. Make your first commit

```bash
git commit -m "Initial commit: Family Calendar App"
```

### 4. Connect to your GitHub repo

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repo name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Or if you're using SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 5. Push to GitHub

```bash
git branch -M main
git push -u origin main
```

## Important: Environment Variables

⚠️ **DO NOT commit your `.env.local` file!** It contains sensitive credentials.

Make sure `.env.local` is in your `.gitignore` (it should already be there since `*.local` is listed).

If you need to share environment variable setup with others (or for your own reference), create a `.env.example` file:

```bash
# .env.example (safe to commit)
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_CALENDAR_ID=your_calendar_id_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Hosting Options

### Option 1: Vercel (Recommended for React/Vite apps)

**Pros:**
- Free tier available
- Automatic deployments on git push
- Built-in environment variable management
- Great performance with CDN
- Easy setup (5 minutes)

**Steps:**
1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite settings
5. Add environment variables in Vercel dashboard:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_CALENDAR_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

Your app will be live at `your-app-name.vercel.app` and will auto-deploy on every push to main branch.

**Build Settings (Vercel auto-detects these, but good to know):**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Option 2: GitHub Pages

**Pros:**
- Free
- Directly from GitHub
- Custom domain support

**Cons:**
- Requires additional configuration for SPA routing
- Slower deployment process
- More setup needed

**Steps:**
1. Install GitHub Pages plugin:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Update `package.json`:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

4. Enable GitHub Pages in repo Settings → Pages → Source: `gh-pages` branch

**Note:** You'll need to configure OAuth redirect URIs for GitHub Pages domain.

### Option 3: Netlify

Similar to Vercel, very easy setup:
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repo
3. Add environment variables
4. Deploy

## Environment Variables Setup

For any hosting platform, you'll need to set these environment variables:

- `VITE_GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `VITE_GOOGLE_CALENDAR_ID` - Your Google Calendar ID
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## OAuth Redirect URI Configuration

When deploying, update your Google OAuth redirect URIs to include:
- Your production URL (e.g., `https://your-app.vercel.app`)
- Keep `http://localhost:5173` for local development

Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Your OAuth 2.0 Client ID → Authorized JavaScript origins

Add your production URL there.

## Recommended: Vercel

For this React/Vite app, **Vercel is the easiest and best option** because:
- Zero configuration needed
- Free tier is generous
- Automatic SSL/HTTPS
- Global CDN
- Easy environment variable management
- Preview deployments for pull requests


