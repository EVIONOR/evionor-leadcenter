ALTER TABLE public.b2b_qualifications 
  ADD COLUMN zip_code text DEFAULT NULL,
  ADD COLUMN city text DEFAULT NULL,
  ADD COLUMN address text DEFAULT NULL;