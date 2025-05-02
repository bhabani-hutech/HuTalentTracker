-- Create storage policies for organization-logos bucket

-- First, create the bucket if it doesn't exist
DO $$ 
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('organization-logos', 'organization-logos', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Allow authenticated users to read from the bucket
DROP POLICY IF EXISTS "Allow authenticated read access" ON storage.objects;
CREATE POLICY "Allow authenticated read access"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'organization-logos');

-- Allow authenticated users to insert into the bucket
DROP POLICY IF EXISTS "Allow authenticated insert access" ON storage.objects;
CREATE POLICY "Allow authenticated insert access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'organization-logos');

-- Allow authenticated users to update objects they own
DROP POLICY IF EXISTS "Allow authenticated update access" ON storage.objects;
CREATE POLICY "Allow authenticated update access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'organization-logos')
WITH CHECK (bucket_id = 'organization-logos');
