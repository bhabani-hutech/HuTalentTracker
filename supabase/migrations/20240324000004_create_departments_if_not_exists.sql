-- Create departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow all users to view departments" ON departments;
CREATE POLICY "Allow all users to view departments"
ON departments FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create departments" ON departments;
CREATE POLICY "Allow authenticated users to create departments"
ON departments FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update departments" ON departments;
CREATE POLICY "Allow authenticated users to update departments"
ON departments FOR UPDATE
TO authenticated
USING (true);

-- Insert default departments if none exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM departments LIMIT 1) THEN
    INSERT INTO departments (name, description) VALUES
      ('Engineering', 'Software development and engineering'),
      ('HR', 'Human Resources'),
      ('Marketing', 'Marketing and communications'),
      ('Sales', 'Sales and business development'),
      ('Finance', 'Finance and accounting'),
      ('Operations', 'Operations and administration');
  END IF;
END
$$;

-- Add to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'departments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE departments;
  END IF;
END
$$;