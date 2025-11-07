-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create leads table to store charger wizard submissions
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT,
  email TEXT,
  phone_number TEXT,
  car_brand TEXT,
  car_model TEXT,
  zip_code TEXT,
  city TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'waste', 'in_progress', 'hold', 'qualified')),
  raw_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow all operations (since this is internal tool)
CREATE POLICY "Allow all operations on leads"
ON public.leads
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for filtering by status
CREATE INDEX idx_leads_status ON public.leads(status);

-- Create index for sorting by created_at
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- Create trigger to update updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();