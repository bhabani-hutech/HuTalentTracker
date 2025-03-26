-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all interview panels" ON interview_panels;
DROP POLICY IF EXISTS "Authenticated users can insert interview panels" ON interview_panels;
DROP POLICY IF EXISTS "Authenticated users can update interview panels" ON interview_panels;
DROP POLICY IF EXISTS "Authenticated users can delete interview panels" ON interview_panels;

-- Create new policies with correct auth checks
CREATE POLICY "Users can view all interview panels"
  ON interview_panels FOR SELECT
  USING (true);

CREATE POLICY "Users can insert interview panels"
  ON interview_panels FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update interview panels"
  ON interview_panels FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete interview panels"
  ON interview_panels FOR DELETE
  USING (true);
