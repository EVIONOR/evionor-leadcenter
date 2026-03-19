CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all inserts on settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all updates on settings" ON public.settings;
DROP POLICY IF EXISTS "Anyone can read settings" ON public.settings;
DROP POLICY IF EXISTS "Deny all public access on settings" ON public.settings;

CREATE POLICY "Deny all public access on settings"
  ON public.settings
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

INSERT INTO public.settings (key, value)
VALUES ('residential_automation_enabled', '{"enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;