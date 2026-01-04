# Family Calendar & Chores App

A simple React application for family organization with Google Calendar integration, shared chores management, weekly to-dos, and notes.

## Features

- 📅 **Google Calendar Integration** - View your family's shared Google Calendar events
- 🧹 **Chores Management** - Track and manage family chores with assignment capabilities
- ✅ **Weekly To-Dos** - Organize weekly tasks and goals
- 📝 **Weekly Notes** - Keep notes organized by week with auto-save functionality

## Tech Stack

- **React** - Frontend framework
- **Vite** - Build tool and dev server
- **Supabase** - Backend database (PostgreSQL)
- **Google Calendar API** - Calendar integration
- **Axios** - HTTP client for API requests

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account and project
- A Google Cloud project with Calendar API enabled
- A Google Calendar API key

## Setup Instructions

### 1. Clone or Navigate to the Project

```bash
cd ~/family-calendar-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL commands from `supabase-setup.sql` to create the necessary tables:
   - `chores` table
   - `todos` table
   - `notes` table
4. Note your Supabase URL and anon key from the project settings

### 4. Set Up Google Calendar OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Calendar API"
   - Click it and press **Enable**
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - If prompted, configure the OAuth consent screen first:
     - Choose **External** (or Internal if using Google Workspace)
     - Fill in the required information
     - Add scopes: `https://www.googleapis.com/auth/calendar.readonly`
     - Add your email as a test user if in testing mode
   - For Application type, choose **Web application**
   - Under **Authorized JavaScript origins**, add:
     - `http://localhost:5173` (for development)
     - Your production URL (for production)
   - Under **Authorized redirect URIs**, add:
     - `http://localhost:5173` (for development)
   - Click **Create**
   - Copy the **Client ID** (you'll need this for your `.env.local` file)
5. Get your shared family calendar ID:
   - Open [Google Calendar](https://calendar.google.com)
   - Go to **Settings** → **Settings for my calendars**
   - Select your family calendar
   - Scroll down to "Integrate calendar"
   - Copy the **Calendar ID** (usually an email address like `abc123@group.calendar.google.com`)

### 5. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_CLIENT_ID=your_oauth_client_id_here
   VITE_GOOGLE_CALENDAR_ID=your_calendar_id_here
   ```

   **Note**: You no longer need `VITE_GOOGLE_CALENDAR_API_KEY` - it's replaced with `VITE_GOOGLE_CLIENT_ID` for OAuth2.

### 6. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

## Project Structure

```
family-calendar-app/
├── src/
│   ├── components/
│   │   ├── Calendar/        # Google Calendar components
│   │   ├── Chores/          # Chores management components
│   │   ├── Todos/           # Weekly to-do components
│   │   └── Notes/           # Weekly notes component
│   ├── services/
│   │   ├── supabase.js      # Supabase client configuration
│   │   ├── googleAuth.js    # Google OAuth2 authentication service
│   │   └── googleCalendar.js # Google Calendar API service
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── supabase-setup.sql       # Database schema SQL
├── package.json
└── vite.config.js
```

## Usage

### Calendar
- **Sign in with Google** to authenticate (required for viewing calendar events)
- View events in week or month view
- Events are automatically fetched from your Google Calendar
- Click "Refresh" to reload events
- Click "Sign Out" to log out
- **Note**: OAuth2 allows you to access private calendars you have permission to view, not just public ones

### Chores
- Add new chores with title, description, and optional assignment
- Mark chores as complete
- Edit or delete existing chores
- View active and completed chores separately

### Weekly To-Dos
- Navigate between weeks using arrow buttons
- Add to-dos for the current week
- Mark to-dos as complete
- Edit or delete to-dos

### Weekly Notes
- Notes are organized by week
- Auto-saves as you type (after 2 seconds of inactivity)
- Navigate between weeks to view/edit different week's notes
- Manual save button available

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to any static hosting service (Vercel, Netlify, etc.).

## Security Notes

- This app uses public access to Supabase (no authentication)
- The Google Calendar API key is exposed in the frontend
- For production use, consider:
  - Adding authentication
  - Using a backend proxy for Google Calendar API calls
  - Implementing Row Level Security (RLS) policies in Supabase

## Troubleshooting

### Calendar events not showing
- **Sign in with Google** - OAuth2 authentication is required (you'll see a "Sign in with Google" button)
- Verify your `VITE_GOOGLE_CLIENT_ID` is correct in `.env.local`
- Check that the Calendar ID (`VITE_GOOGLE_CALENDAR_ID`) is correct
- Ensure you have permission to view the calendar (you don't need to be the owner)
- Check that Google Identity Services library loads (check browser console)
- Verify OAuth consent screen is configured in Google Cloud Console
- Check browser console for detailed error messages
- **Note**: Unlike API keys, OAuth2 works with private calendars as long as you have viewing permissions

### Supabase errors
- Verify your Supabase URL and anon key
- Ensure you've run the SQL setup script
- Check that RLS policies allow public access

### Build errors
- Make sure all dependencies are installed: `npm install`
- Check that environment variables are set correctly
- Clear node_modules and reinstall if needed

## License

This project is for personal/family use.

