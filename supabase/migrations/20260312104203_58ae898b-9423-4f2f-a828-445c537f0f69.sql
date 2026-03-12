CREATE TABLE public.b2b_qualifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_b2b_id TEXT,
  company_name TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  project_type TEXT,
  location_type TEXT,
  charger_count INTEGER,
  urgency TEXT,
  has_own_electrician BOOLEAN,
  qualification_branch TEXT,
  car_types TEXT,
  ev_type TEXT,
  phases TEXT,
  main_fuse TEXT,
  needs_load_management BOOLEAN,
  has_solar BOOLEAN,
  has_wifi BOOLEAN,
  cable_or_socket TEXT,
  features_needed TEXT[] DEFAULT '{}',
  offer_sent BOOLEAN DEFAULT false,
  discount_applied BOOLEAN DEFAULT false,
  has_electrical_prep BOOLEAN,
  wants_photos BOOLEAN,
  photos_received BOOLEAN DEFAULT false,
  needs_technical_callback BOOLEAN DEFAULT false,
  lead_temperature TEXT DEFAULT 'warm',
  next_step TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new',
  timeline TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.b2b_qualifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on b2b_qualifications"
  ON public.b2b_qualifications
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_b2b_qualifications_updated_at
  BEFORE UPDATE ON public.b2b_qualifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();