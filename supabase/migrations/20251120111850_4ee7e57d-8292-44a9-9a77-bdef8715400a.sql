-- Create settings table to store auto-processing configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings (for checking auto-process state)
CREATE POLICY "Anyone can read settings"
  ON public.settings
  FOR SELECT
  USING (true);

-- Only allow updates (admins would control this via UI)
CREATE POLICY "Allow all updates on settings"
  ON public.settings
  FOR UPDATE
  USING (true);

-- Allow inserts
CREATE POLICY "Allow all inserts on settings"
  ON public.settings
  FOR INSERT
  WITH CHECK (true);

-- Insert the auto_process_leads setting
INSERT INTO public.settings (key, value)
VALUES ('auto_process_leads', '{"enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;