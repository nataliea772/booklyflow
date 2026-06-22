-- BooklyFlow Supabase schema
-- Run this in the Supabase SQL Editor for your project.

create extension if not exists "pgcrypto";

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  duration_minutes integer not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  appointment_date date not null,
  start_time text not null,
  end_time text not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz default now()
);

create table if not exists business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  start_hour text not null,
  end_hour text not null,
  buffer_minutes integer not null default 15,
  working_days integer[] not null default '{0,1,2,3,4}',
  created_at timestamptz default now()
);

create table if not exists blocked_times (
  id uuid primary key default gen_random_uuid(),
  blocked_date date not null,
  start_time text not null,
  end_time text not null,
  reason text,
  created_at timestamptz default now()
);

-- Row Level Security (anonymous access until auth is added)
alter table services enable row level security;
alter table appointments enable row level security;
alter table business_settings enable row level security;
alter table blocked_times enable row level security;

create policy "Public read services"
  on services for select
  using (true);

create policy "Public read appointments"
  on appointments for select
  using (true);

create policy "Public insert appointments"
  on appointments for insert
  with check (true);

create policy "Public update appointments"
  on appointments for update
  using (true)
  with check (true);

create policy "Public read business_settings"
  on business_settings for select
  using (true);

create policy "Public read blocked_times"
  on blocked_times for select
  using (true);

-- Seed data
insert into services (name, description, price, duration_minutes, is_active)
values
  (
    'Haircut & Style',
    'Professional cut with blow-dry styling',
    55,
    45,
    true
  ),
  (
    'Color Treatment',
    'Full color application with conditioning',
    120,
    90,
    true
  ),
  (
    'Manicure',
    'Classic manicure with polish of your choice',
    35,
    30,
    true
  );

insert into business_settings (
  business_name,
  start_hour,
  end_hour,
  buffer_minutes,
  working_days
)
values (
  'BooklyFlow Studio',
  '09:00',
  '18:00',
  15,
  '{0,1,2,3,4}'
);
