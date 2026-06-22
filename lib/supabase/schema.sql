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
  image_url text,
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
  description text,
  phone text,
  email text,
  address text,
  logo_url text,
  cover_image_url text,
  primary_color text,
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

-- Row Level Security (anonymous booking + authenticated admin access)
-- Admin routes are protected in the Next.js app; public booking still uses the anon key.
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

create policy "Authenticated insert services"
  on services for insert
  to authenticated
  with check (true);

create policy "Authenticated update services"
  on services for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated update business_settings"
  on business_settings for update
  to authenticated
  using (true)
  with check (true);

-- Supabase Storage (run after creating bucket in dashboard or via migration)
-- Dashboard: Storage → New bucket → name "booklyflow-assets" → Public: ON
-- Or run lib/supabase/migrations/001_business_branding.sql for full migration.

-- Seed data
insert into services (name, description, price, duration_minutes, is_active)
values
  (
    'תספורת ועיצוב',
    'תספורת מקצועית עם ייבוש ועיצוב',
    55,
    45,
    true
  ),
  (
    'טיפול צבע',
    'צביעה מלאה עם טיפול לשיער',
    120,
    90,
    true
  ),
  (
    'מניקור',
    'מניקור קלאסי עם לק לבחירתך',
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
  'סטודיו BooklyFlow',
  '09:00',
  '18:00',
  15,
  '{0,1,2,3,4}'
);

-- Admin authentication
-- 1. In Supabase: Authentication → Providers → enable Email.
-- 2. Authentication → Users → Add user (email + password) for your admin account.
-- 3. Admin pages (/admin/*) require login when Supabase env vars are configured.
-- 4. Public routes (/ and /book) remain open without login.
