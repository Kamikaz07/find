-- Add expiration_date field to advertisements table
ALTER TABLE IF EXISTS advertisements
ADD COLUMN IF NOT EXISTS expiration_date TIMESTAMP WITH TIME ZONE;
