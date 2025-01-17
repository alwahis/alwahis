-- Begin transaction
BEGIN;

-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
    id SERIAL PRIMARY KEY,
    departure_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    price_per_seat INTEGER NOT NULL,
    car_type TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_phone TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ride_requests table
CREATE TABLE IF NOT EXISTS ride_requests (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id),
    departure_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    desired_date DATE NOT NULL,
    seats_needed INTEGER DEFAULT 1,
    rider_name TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints
ALTER TABLE rides ADD CONSTRAINT check_available_seats 
    CHECK (available_seats >= 0 AND available_seats <= total_seats);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rides_departure_city ON rides(departure_city);
CREATE INDEX IF NOT EXISTS idx_rides_destination_city ON rides(destination_city);
CREATE INDEX IF NOT EXISTS idx_rides_departure_time ON rides(departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_available_seats ON rides(available_seats);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);

-- Create search_rides function
CREATE OR REPLACE FUNCTION search_rides(
  p_departure_city text,
  p_destination_city text,
  p_date date,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_departure_time_start time DEFAULT NULL,
  p_departure_time_end time DEFAULT NULL,
  p_min_available_seats integer DEFAULT NULL,
  p_sort_by text DEFAULT 'departure_time',
  p_sort_order text DEFAULT 'asc',
  p_page integer DEFAULT 1,
  p_per_page integer DEFAULT 10
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_offset integer;
  v_limit integer;
  v_result json;
BEGIN
  -- Calculate offset and limit for pagination
  v_limit := p_per_page;
  v_offset := (p_page - 1) * p_per_page;

  -- Construct the query dynamically
  WITH filtered_rides AS (
    SELECT *
    FROM rides
    WHERE (departure_city ILIKE p_departure_city || '%')
    AND (destination_city ILIKE p_destination_city || '%')
    AND (DATE(departure_time) = p_date)
    AND (p_min_price IS NULL OR price_per_seat >= p_min_price)
    AND (p_max_price IS NULL OR price_per_seat <= p_max_price)
    AND (p_departure_time_start IS NULL OR CAST(departure_time AS time) >= p_departure_time_start)
    AND (p_departure_time_end IS NULL OR CAST(departure_time AS time) <= p_departure_time_end)
    AND (p_min_available_seats IS NULL OR available_seats >= p_min_available_seats)
    AND status = 'active'
  ),
  sorted_rides AS (
    SELECT *
    FROM filtered_rides
    ORDER BY
      CASE WHEN p_sort_by = 'departure_time' AND p_sort_order = 'asc' THEN departure_time::text END ASC,
      CASE WHEN p_sort_by = 'departure_time' AND p_sort_order = 'desc' THEN departure_time::text END DESC,
      CASE WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN price_per_seat::text END ASC,
      CASE WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN price_per_seat::text END DESC,
      CASE WHEN p_sort_by = 'available_seats' AND p_sort_order = 'asc' THEN available_seats::text END ASC,
      CASE WHEN p_sort_by = 'available_seats' AND p_sort_order = 'desc' THEN available_seats::text END DESC
    LIMIT v_limit
    OFFSET v_offset
  )
  SELECT json_build_object(
    'rides', COALESCE(json_agg(r.*), '[]'::json),
    'total_count', (SELECT COUNT(*) FROM filtered_rides),
    'page', p_page,
    'per_page', p_per_page
  ) INTO v_result
  FROM sorted_rides r;

  RETURN v_result;
END;
$$;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
