-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Rides table (offered by drivers)
create table if not exists rides (
  id uuid default uuid_generate_v4() primary key,
  start_point text not null,
  end_point text not null,
  date date not null,
  time time not null,
  seats integer not null,
  price integer not null,
  driver_name text not null,
  driver_phone text not null,
  whatsapp_link text generated always as ('https://wa.me/' || regexp_replace(driver_phone, '^0', '964')) stored,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ride requests table (posted by riders)
create table if not exists ride_requests (
  id uuid default uuid_generate_v4() primary key,
  start_point text not null,
  end_point text not null,
  date date not null,
  seats_needed integer not null,
  max_price integer,
  rider_name text not null,
  rider_phone text not null,
  whatsapp_link text generated always as ('https://wa.me/' || regexp_replace(rider_phone, '^0', '964')) stored,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS but allow all operations
alter table rides enable row level security;
alter table ride_requests enable row level security;

-- Allow all operations for everyone
create policy "Allow all operations for rides"
  on rides for all
  using (true)
  with check (true);

create policy "Allow all operations for ride_requests"
  on ride_requests for all
  using (true)
  with check (true);
