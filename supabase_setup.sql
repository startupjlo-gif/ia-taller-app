-- SQL Script to setup Supabase for real-time workshop persistence
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)

CREATE TABLE IF NOT EXISTS public.workshop_sessions (
  pin TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.workshop_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON public.workshop_sessions;
DROP POLICY IF EXISTS "Allow public insert access" ON public.workshop_sessions;
DROP POLICY IF EXISTS "Allow public update access" ON public.workshop_sessions;

-- Create policies for public access during workshop
CREATE POLICY "Allow public read access" ON public.workshop_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.workshop_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.workshop_sessions FOR UPDATE USING (true);
