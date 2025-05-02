-- Add email and phone fields to organizations table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'email') THEN
        ALTER TABLE organizations ADD COLUMN email VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'phone') THEN
        ALTER TABLE organizations ADD COLUMN phone VARCHAR;
    END IF;
END $$;

-- Enable realtime for the organizations table
alter publication supabase_realtime add table organizations;
