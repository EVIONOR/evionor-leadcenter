-- NOTE: !! IMPORTANT !! THIS WAS RUN MANUALLY IN EVIONOR PROJECT, NOT THE BASE SUPABASE PROJECT !!
-- Create lead_manager_settings table to store configuration like automatic processing toggle
CREATE TABLE IF NOT EXISTS public.lead_manager_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.lead_manager_settings ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read settings
CREATE POLICY "Allow authenticated users to read settings"
  ON public.lead_manager_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow authenticated users to update settings
CREATE POLICY "Allow authenticated users to update settings"
  ON public.lead_manager_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default automatic processing setting (disabled by default)
INSERT INTO public.lead_manager_settings (setting_key, setting_value)
VALUES ('automatic_processing_enabled', '{"enabled": false}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lead_manager_settings_key ON public.lead_manager_settings(setting_key);
