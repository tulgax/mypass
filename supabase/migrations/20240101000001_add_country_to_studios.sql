-- Add country column to studios table for studio sign-up flow
ALTER TABLE studios ADD COLUMN IF NOT EXISTS country TEXT;
