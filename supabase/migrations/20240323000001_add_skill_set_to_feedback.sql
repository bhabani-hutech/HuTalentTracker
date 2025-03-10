-- Add skill_set column to feedback table
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS skill_set integer DEFAULT 0;
