
-- Allow anyone to upload to quotes bucket
CREATE POLICY "Allow public upload to quotes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'quotes');

-- Allow anyone to read from quotes bucket
CREATE POLICY "Allow public read from quotes"
ON storage.objects FOR SELECT
USING (bucket_id = 'quotes');
