-- Supabase Database Setup
-- Run these SQL commands in your Supabase SQL Editor

-- Create chores table
CREATE TABLE IF NOT EXISTS chores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dinner_schedule table
CREATE TABLE IF NOT EXISTS dinner_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week TEXT NOT NULL CHECK (week IN ('Week A', 'Week B')),
  day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  dinner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(week, day)
);

-- Create errands table
CREATE TABLE IF NOT EXISTS errands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_week_start ON todos(week_start);
CREATE INDEX IF NOT EXISTS idx_notes_week_start ON notes(week_start);
CREATE INDEX IF NOT EXISTS idx_chores_completed ON chores(completed);
CREATE INDEX IF NOT EXISTS idx_dinner_schedule_week_day ON dinner_schedule(week, day);

-- Enable Row Level Security (RLS) but allow all operations since we're not using auth
ALTER TABLE chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dinner_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE errands ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since no auth)
CREATE POLICY "Allow all operations on chores" ON chores
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on todos" ON todos
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on dinner_schedule" ON dinner_schedule
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on errands" ON errands
  FOR ALL USING (true) WITH CHECK (true);

