-- Add hiring_partner_id column to candidates table if it doesn't exist already
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS hiring_partner_id INTEGER REFERENCES organizations(id);

-- Add candidate_source column to candidates table if it doesn't exist already
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS candidate_source TEXT DEFAULT 'Direct Apply';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_candidates_hiring_partner_id ON candidates(hiring_partner_id);
