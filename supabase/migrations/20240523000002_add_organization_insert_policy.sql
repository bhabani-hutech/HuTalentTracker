DROP POLICY IF EXISTS "Allow authenticated inserts" ON organizations;
CREATE POLICY "Allow authenticated inserts"
ON organizations
FOR INSERT
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime for the organizations table
alter publication supabase_realtime add table organizations;