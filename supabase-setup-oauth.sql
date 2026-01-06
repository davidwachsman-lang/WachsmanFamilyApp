-- Supabase Setup: Google Calendar OAuth Tokens Table
-- Run this SQL in your Supabase SQL Editor

-- Create table to store Google OAuth tokens
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Single row constraint
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role (backend) to read/write
-- Regular users cannot access this table
CREATE POLICY "Service role can manage tokens" ON google_calendar_tokens
  FOR ALL 
  USING (false) 
  WITH CHECK (false);

-- Note: Service role bypasses RLS, so this table is only accessible
-- from Edge Functions using the service role key


