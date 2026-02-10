
-- Create public storage bucket for PDF quotes
INSERT INTO storage.buckets (id, name, public) VALUES ('quotes', 'quotes', true);

-- Anyone can read quotes (for email download links)
CREATE POLICY "Public read access for quotes"
ON storage.objects FOR SELECT
USING (bucket_id = 'quotes');

-- Authenticated users can upload quotes
CREATE POLICY "Authenticated users can upload quotes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'quotes' AND auth.role() = 'authenticated');

-- Authenticated users can update their quotes
CREATE POLICY "Authenticated users can update quotes"
ON storage.objects FOR UPDATE
USING (bucket_id = 'quotes' AND auth.role() = 'authenticated');
