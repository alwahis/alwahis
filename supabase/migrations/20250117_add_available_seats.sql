-- Begin transaction
BEGIN;

-- Drop existing indexes and constraints if they exist
DROP INDEX IF EXISTS idx_rides_available_seats;
ALTER TABLE rides DROP CONSTRAINT IF EXISTS check_available_seats;

-- Add available_seats column directly
ALTER TABLE rides ADD COLUMN IF NOT EXISTS available_seats INTEGER;

-- Set initial values
UPDATE rides SET available_seats = total_seats WHERE available_seats IS NULL;

-- Set NOT NULL constraint
ALTER TABLE rides ALTER COLUMN available_seats SET NOT NULL;

-- Add constraint
ALTER TABLE rides ADD CONSTRAINT check_available_seats 
    CHECK (available_seats >= 0 AND available_seats <= total_seats);

-- Create index
CREATE INDEX idx_rides_available_seats ON rides(available_seats);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
