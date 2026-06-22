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
  admin_note text,
  sms_sent_at timestamptz,
  sms_error text,
  created_at timestamptz default now()
);

create table if not exists business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  start_hour text not null,
  end_hour text not null,
  buffer_minutes integer not null default 15,
  working_days integer[] not null default '{0,1,2,3,4}',
  working_hours jsonb,
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
  start_date date not null,
  end_date date not null,
  blocked_date date,
  start_time text,
  end_time text,
  is_full_day boolean default true,
  reason text,
  created_at timestamptz default now()
);

create table if not exists appointment_notifications (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments(id) on delete cascade not null,
  event_type text not null,
  channel text not null default 'sms',
  status text not null,
  error text,
  created_at timestamptz default now()
);

create index if not exists appointment_notifications_appointment_id_idx
  on appointment_notifications (appointment_id);

alter table services enable row level security;
alter table appointments enable row level security;
alter table business_settings enable row level security;
alter table blocked_times enable row level security;
alter table appointment_notifications enable row level security;

create policy "services_public_read_active"
  on services for select
  to anon
  using (is_active = true);

create policy "services_authenticated_read_all"
  on services for select
  to authenticated
  using (auth.role() = 'authenticated');

create policy "appointments_public_read"
  on appointments for select
  using (true);

create policy "appointments_public_insert"
  on appointments for insert
  with check (true);

create policy "appointments_authenticated_update"
  on appointments for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "business_settings_public_read"
  on business_settings for select
  using (true);

create policy "Public read blocked_times"
  on blocked_times for select
  using (true);

create policy "blocked_times_authenticated_insert"
  on blocked_times for insert
  to authenticated
  with check (auth.role() = 'authenticated');

create policy "blocked_times_authenticated_update"
  on blocked_times for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "blocked_times_authenticated_delete"
  on blocked_times for delete
  to authenticated
  using (auth.role() = 'authenticated');

create policy "appointment_notifications_authenticated_insert"
  on appointment_notifications for insert
  to authenticated
  with check (auth.role() = 'authenticated');

create policy "appointment_notifications_authenticated_read"
  on appointment_notifications for select
  to authenticated
  using (auth.role() = 'authenticated');

create policy "services_authenticated_insert"
  on services for insert
  to authenticated
  with check (auth.role() = 'authenticated');

create policy "services_authenticated_update"
  on services for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "services_authenticated_delete"
  on services for delete
  to authenticated
  using (auth.role() = 'authenticated');

create policy "Authenticated update business_settings"
  on business_settings for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

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
