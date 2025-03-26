-- Create interview_panels table if it doesn't exist
CREATE TABLE IF NOT EXISTS interview_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  members UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE interview_panels ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view all interview panels" ON interview_panels;
CREATE POLICY "Users can view all interview panels"
  ON interview_panels FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert interview panels" ON interview_panels;
CREATE POLICY "Authenticated users can insert interview panels"
  ON interview_panels FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update interview panels" ON interview_panels;
CREATE POLICY "Authenticated users can update interview panels"
  ON interview_panels FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete interview panels" ON interview_panels;
CREATE POLICY "Authenticated users can delete interview panels"
  ON interview_panels FOR DELETE
  USING (auth.role() = 'authenticated');

-- Enable realtime
alter publication supabase_realtime add table interview_panels;
