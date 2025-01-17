-- Begin transaction
BEGIN;

-- Rename columns in rides table if they exist
DO $$ 
BEGIN
    -- Check if the old columns exist and rename them
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rides' AND column_name = 'from_location') THEN
        ALTER TABLE rides RENAME COLUMN from_location TO departure_city;
        ALTER TABLE rides RENAME COLUMN to_location TO destination_city;
    END IF;
END $$;

-- Add new columns to rides table
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rides' AND column_name = 'total_seats') THEN
        ALTER TABLE rides ADD COLUMN total_seats INTEGER;
        ALTER TABLE rides ADD COLUMN car_type TEXT;
        ALTER TABLE rides ADD COLUMN driver_name TEXT;
        ALTER TABLE rides ADD COLUMN driver_phone TEXT;
    END IF;
END $$;

-- Update status values
UPDATE rides SET status = 'active' WHERE status = 'published';

-- Set NOT NULL constraints after ensuring data is migrated
ALTER TABLE rides 
    ALTER COLUMN total_seats SET NOT NULL,
    ALTER COLUMN car_type SET NOT NULL,
    ALTER COLUMN driver_name SET NOT NULL,
    ALTER COLUMN driver_phone SET NOT NULL;

-- Rename columns in ride_requests table if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ride_requests' AND column_name = 'from_location') THEN
        ALTER TABLE ride_requests RENAME COLUMN from_location TO departure_city;
        ALTER TABLE ride_requests RENAME COLUMN to_location TO destination_city;
        ALTER TABLE ride_requests RENAME COLUMN preferred_date TO desired_date;
    END IF;
END $$;

-- Add new columns to ride_requests table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ride_requests' AND column_name = 'seats_needed') THEN
        ALTER TABLE ride_requests ADD COLUMN seats_needed INTEGER DEFAULT 1;
        ALTER TABLE ride_requests ADD COLUMN rider_name TEXT;
        ALTER TABLE ride_requests ADD COLUMN rider_phone TEXT;
        ALTER TABLE ride_requests ADD COLUMN preferred_car_type TEXT;
    END IF;
END $$;

-- Update status values
UPDATE ride_requests SET status = 'pending' WHERE status = 'open';

-- Set NOT NULL constraints after ensuring data is migrated
ALTER TABLE ride_requests 
    ALTER COLUMN seats_needed SET NOT NULL,
    ALTER COLUMN rider_name SET NOT NULL,
    ALTER COLUMN rider_phone SET NOT NULL;

-- Update indexes
DROP INDEX IF EXISTS idx_rides_locations;
DROP INDEX IF EXISTS idx_ride_requests_locations;
DROP INDEX IF EXISTS idx_ride_requests_preferred_date;

CREATE INDEX IF NOT EXISTS idx_rides_locations ON rides(departure_city, destination_city);
CREATE INDEX IF NOT EXISTS idx_rides_departure_time ON rides(departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);

CREATE INDEX IF NOT EXISTS idx_ride_requests_locations ON ride_requests(departure_city, destination_city);
CREATE INDEX IF NOT EXISTS idx_ride_requests_desired_date ON ride_requests(desired_date);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON ride_requests(status);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create or replace triggers for updated_at
DROP TRIGGER IF EXISTS update_rides_updated_at ON rides;
DROP TRIGGER IF EXISTS update_ride_requests_updated_at ON ride_requests;

CREATE TRIGGER update_rides_updated_at
    BEFORE UPDATE ON rides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ride_requests_updated_at
    BEFORE UPDATE ON ride_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commit transaction
COMMIT;
