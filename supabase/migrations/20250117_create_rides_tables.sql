-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    departure_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    price_per_seat INTEGER NOT NULL,
    car_type TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ride_requests table
CREATE TABLE IF NOT EXISTS ride_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    departure_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    desired_date TIMESTAMP WITH TIME ZONE NOT NULL,
    seats_needed INTEGER NOT NULL,
    rider_name TEXT NOT NULL,
    rider_phone TEXT NOT NULL,
    preferred_car_type TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_rides_locations ON rides(departure_city, destination_city);
CREATE INDEX IF NOT EXISTS idx_rides_departure_time ON rides(departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);

CREATE INDEX IF NOT EXISTS idx_ride_requests_locations ON ride_requests(departure_city, destination_city);
CREATE INDEX IF NOT EXISTS idx_ride_requests_desired_date ON ride_requests(desired_date);
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
