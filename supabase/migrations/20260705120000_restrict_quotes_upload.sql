
-- Quote PDFs are now uploaded exclusively via the "upload-quote" edge function
-- using the service-role key (which bypasses RLS regardless of policy), so
-- direct client-side uploads to the public "quotes" bucket are no longer needed
-- and are locked down here.
DROP POLICY IF EXISTS "Allow public upload to quotes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload quotes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update quotes" ON storage.objects;

CREATE POLICY "Deny all public writes to quotes"
ON storage.objects FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "Deny all public updates to quotes"
ON storage.objects FOR UPDATE
TO public
USING (false);

-- Public read access is left untouched: quote download links are shared with
-- customers in emails and must remain reachable without authentication.
