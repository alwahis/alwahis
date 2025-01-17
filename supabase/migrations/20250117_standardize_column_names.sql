-- Begin transaction
BEGIN;

-- Rename columns if they exist with old names
ALTER TABLE rides RENAME COLUMN IF EXISTS from_location TO departure_city;
ALTER TABLE rides RENAME COLUMN IF EXISTS to_location TO destination_city;

-- Make sure all required columns exist with correct names
ALTER TABLE rides ADD COLUMN IF NOT EXISTS departure_city VARCHAR(100);
ALTER TABLE rides ADD COLUMN IF NOT EXISTS destination_city VARCHAR(100);
ALTER TABLE rides ADD COLUMN IF NOT EXISTS departure_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS total_seats INTEGER;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS available_seats INTEGER;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS price_per_seat INTEGER;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Set NOT NULL constraints
ALTER TABLE rides ALTER COLUMN departure_city SET NOT NULL;
ALTER TABLE rides ALTER COLUMN destination_city SET NOT NULL;
ALTER TABLE rides ALTER COLUMN departure_time SET NOT NULL;
ALTER TABLE rides ALTER COLUMN total_seats SET NOT NULL;
ALTER TABLE rides ALTER COLUMN available_seats SET NOT NULL;
ALTER TABLE rides ALTER COLUMN price_per_seat SET NOT NULL;

-- Add constraints
ALTER TABLE rides DROP CONSTRAINT IF EXISTS check_available_seats;
ALTER TABLE rides ADD CONSTRAINT check_available_seats 
    CHECK (available_seats >= 0 AND available_seats <= total_seats);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rides_departure_city ON rides(departure_city);
CREATE INDEX IF NOT EXISTS idx_rides_destination_city ON rides(destination_city);
CREATE INDEX IF NOT EXISTS idx_rides_departure_time ON rides(departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_available_seats ON rides(available_seats);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
