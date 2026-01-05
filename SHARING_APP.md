# Sharing Your App with Others

## Short Answer

**It depends on your Google OAuth app's publishing status:**

- **If your app is in "Testing" mode**: YES, you need to add each person's Gmail address
- **If your app is "In production"**: NO, anyone can sign in (but you may need to verify with Google first)

## How to Check Your OAuth App Status

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **OAuth consent screen**
3. Look at the top - it will show either:
   - **"Testing"** - Limited to test users
   - **"In production"** - Available to everyone

## Option 1: Add Test Users (Easiest for small groups)

If your app is in **Testing** mode, you need to add each person:

### Steps:
1. Go to **OAuth consent screen** in Google Cloud Console
2. Scroll down to **Test users** section
3. Click **+ ADD USERS**
4. Enter each person's Gmail address (one per line)
5. Click **ADD**
6. Each person will receive an email notification (optional)

### Limitations:
- Maximum 100 test users
- Each person must use the Gmail address you added
- If they have multiple Google accounts, they need to use the one you added

### Pros:
- ✅ Easy setup
- ✅ No Google verification needed
- ✅ Good for family/friends

### Cons:
- ❌ Must manually add each user
- ❌ Limited to 100 users
- ❌ Warning banner shows "This app isn't verified"

## Option 2: Publish Your App (Best for many users)

If you want to share with many people or the general public:

### Steps:
1. Go to **OAuth consent screen** in Google Cloud Console
2. Click **PUBLISH APP** button
3. You may need to verify your app with Google (depending on scopes used)

### For Calendar Read-Only Scope:
- The `calendar.readonly` scope is considered "sensitive"
- Google may require app verification if you're sharing broadly
- For personal/family use, you can usually publish without verification

### Verification Requirements (if prompted):
- Privacy policy URL
- App verification process (can take days/weeks)
- Usually only required for broad public distribution

### Pros:
- ✅ No user limit
- ✅ No need to add individual users
- ✅ Anyone with a Google account can sign in

### Cons:
- ⚠️ May require verification process
- ⚠️ More complex setup
- ⚠️ Privacy policy may be required

## Recommendation for Your Family App

For a **family calendar app** shared with family members:

1. **Start with Test Users** (easiest):
   - Add family members' Gmail addresses
   - Works immediately
   - No verification needed

2. **Move to Production Later** (if needed):
   - Only if you want to share with many people
   - Or if you hit the 100 user limit

## Adding Test Users

### Step-by-Step:
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Make sure you're on the **OAuth consent screen** tab
3. Scroll down to **Test users**
4. Click **+ ADD USERS**
5. Enter email addresses (one per line):
   ```
   person1@gmail.com
   person2@gmail.com
   family.member@example.com
   ```
6. Click **ADD**
7. Users will receive an email (they can ignore it)

### Important Notes:
- Users must sign in with the exact email you added
- They'll see a warning: "Google hasn't verified this app" - this is normal
- They should click "Continue" to proceed

## What Each Person Needs to Do

1. Visit your Vercel app URL
2. Click "Sign in with Google"
3. Sign in with their Gmail (the one you added as a test user)
4. Grant calendar access permissions
5. They'll be able to view the calendar!

## Troubleshooting

### "This app isn't verified" warning
- This is normal for apps in Testing mode
- Users should click "Advanced" → "Go to [Your App] (unsafe)" to proceed

### User can't sign in
- Check that their exact Gmail address is in the test users list
- Make sure they're using the same Gmail you added
- Try clearing browser cache

### App verification required
- If you publish and Google asks for verification:
  - You can add a simple privacy policy
  - For family/personal use, verification may not be strictly required
  - Consider staying in Testing mode if verification is too complex

