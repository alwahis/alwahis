-- Begin transaction
BEGIN;

-- Add departure_time column
ALTER TABLE rides ADD COLUMN IF NOT EXISTS departure_time TIMESTAMP WITH TIME ZONE;

-- Set NOT NULL constraint
ALTER TABLE rides ALTER COLUMN departure_time SET NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_rides_departure_time ON rides(departure_time);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
