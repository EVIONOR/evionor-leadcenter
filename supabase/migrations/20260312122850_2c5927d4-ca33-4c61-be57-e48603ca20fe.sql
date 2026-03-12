
-- Lock down b2b_qualifications: deny all public access (only service role via edge functions)
DROP POLICY IF EXISTS "Allow all operations on b2b_qualifications" ON b2b_qualifications;
CREATE POLICY "Deny all public access on b2b_qualifications" ON b2b_qualifications
  FOR ALL TO public
  USING (false)
  WITH CHECK (false);

-- Lock down leads table: only allow insert for webhooks, deny select/update/delete to public
DROP POLICY IF EXISTS "Allow all operations on leads" ON leads;
CREATE POLICY "Deny all public access on leads" ON leads
  FOR ALL TO public
  USING (false)
  WITH CHECK (false);
