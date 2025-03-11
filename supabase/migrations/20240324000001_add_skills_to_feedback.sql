-- Add domain_skills and soft_skills columns to feedback table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback' AND column_name = 'domain_skills') THEN
        ALTER TABLE feedback ADD COLUMN domain_skills integer DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback' AND column_name = 'soft_skills') THEN
        ALTER TABLE feedback ADD COLUMN soft_skills integer DEFAULT 0;
    END IF;
END $$;