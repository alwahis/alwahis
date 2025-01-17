-- Begin transaction
BEGIN;

-- Add available_seats column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rides' AND column_name = 'available_seats') THEN
        ALTER TABLE rides ADD COLUMN available_seats INTEGER;
        -- Set initial value equal to total_seats
        UPDATE rides SET available_seats = total_seats WHERE available_seats IS NULL;
        -- Set NOT NULL constraint
        ALTER TABLE rides ALTER COLUMN available_seats SET NOT NULL;
    END IF;
END $$;

-- Add constraint to ensure available_seats doesn't exceed total_seats
ALTER TABLE rides DROP CONSTRAINT IF EXISTS check_available_seats;
ALTER TABLE rides ADD CONSTRAINT check_available_seats 
    CHECK (available_seats >= 0 AND available_seats <= total_seats);

-- Create index for available seats to optimize search queries
CREATE INDEX IF NOT EXISTS idx_rides_available_seats ON rides(available_seats);

COMMIT;
