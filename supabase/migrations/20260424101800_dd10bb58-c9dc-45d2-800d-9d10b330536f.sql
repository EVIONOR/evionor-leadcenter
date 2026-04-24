ALTER TABLE public.b2b_qualifications
ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'hu';