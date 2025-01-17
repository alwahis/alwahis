-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    available_seats INTEGER NOT NULL,
    price_per_seat INTEGER NOT NULL,
    whatsapp_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ride_requests table
CREATE TABLE IF NOT EXISTS ride_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    preferred_date TIMESTAMP WITH TIME ZONE NOT NULL,
    whatsapp_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_rides_locations ON rides(from_location, to_location);
CREATE INDEX IF NOT EXISTS idx_rides_departure_time ON rides(departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);

CREATE INDEX IF NOT EXISTS idx_ride_requests_locations ON ride_requests(from_location, to_location);
CREATE INDEX IF NOT EXISTS idx_ride_requests_preferred_date ON ride_requests(preferred_date);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON ride_requests(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_rides_updated_at
    BEFORE UPDATE ON rides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ride_requests_updated_at
    BEFORE UPDATE ON ride_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
