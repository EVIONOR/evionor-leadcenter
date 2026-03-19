CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

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

CREATE OR REPLACE FUNCTION public.invoke_process_residential_offers_job()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://rhbfjjfbulppqhjjxofh.supabase.co/functions/v1/process-residential-offers',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYmZqamZidWxwcHFoamp4b2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1Mjc1NzEsImV4cCI6MjA3ODEwMzU3MX0.zR-M6n3pfolAEU4iyOk5LDL9V3mb2CHUBsVeUk9v3VA',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYmZqamZidWxwcHFoamp4b2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1Mjc1NzEsImV4cCI6MjA3ODEwMzU3MX0.zR-M6n3pfolAEU4iyOk5LDL9V3mb2CHUBsVeUk9v3VA'
    ),
    body := jsonb_build_object('mode', 'scheduled')
  );
END;
$$;

DO $$
DECLARE
  existing_job_id bigint;
BEGIN
  SELECT jobid
  INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'process-residential-offers-every-2-hours';

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;
END;
$$;

SELECT cron.schedule(
  'process-residential-offers-every-2-hours',
  '0 */2 * * *',
  $$SELECT public.invoke_process_residential_offers_job();$$
);
