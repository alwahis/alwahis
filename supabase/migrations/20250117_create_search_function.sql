-- Create the search_rides function
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
  v_total_count integer;
  v_rides json;
BEGIN
  -- Calculate offset and limit for pagination
  v_offset := (p_page - 1) * p_per_page;
  v_limit := p_per_page;

  -- Build the query dynamically
  WITH filtered_rides AS (
    SELECT *
    FROM rides
    WHERE status = 'published'
      AND departure_city = p_departure_city
      AND destination_city = p_destination_city
      AND date_trunc('day', departure_time) = p_date
      AND (p_min_price IS NULL OR price_per_seat >= p_min_price)
      AND (p_max_price IS NULL OR price_per_seat <= p_max_price)
      AND (p_departure_time_start IS NULL OR departure_time::time >= p_departure_time_start)
      AND (p_departure_time_end IS NULL OR departure_time::time <= p_departure_time_end)
      AND (p_min_available_seats IS NULL OR available_seats >= p_min_available_seats)
  )
  SELECT 
    json_build_object(
      'rides', COALESCE(json_agg(r.*), '[]'::json),
      'pagination', json_build_object(
        'current_page', p_page,
        'per_page', p_per_page,
        'total_items', (SELECT count(*) FROM filtered_rides),
        'total_pages', CEIL((SELECT count(*) FROM filtered_rides)::float / p_per_page)
      )
    )
  INTO v_rides
  FROM (
    SELECT *
    FROM filtered_rides
    ORDER BY
      CASE 
        WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN price_per_seat::text
        WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN price_per_seat::text
        WHEN p_sort_by = 'departure_time' AND p_sort_order = 'asc' THEN departure_time::text
        WHEN p_sort_by = 'departure_time' AND p_sort_order = 'desc' THEN departure_time::text
        WHEN p_sort_by = 'available_seats' AND p_sort_order = 'asc' THEN available_seats::text
        WHEN p_sort_by = 'available_seats' AND p_sort_order = 'desc' THEN available_seats::text
      END
    LIMIT v_limit
    OFFSET v_offset
  ) r;

  RETURN v_rides;
END;
$$;
