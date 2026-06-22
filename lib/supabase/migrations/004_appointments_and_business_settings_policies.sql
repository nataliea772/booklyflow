-- BooklyFlow migration: appointments update + business_settings policies
-- Run in Supabase SQL Editor if appointment edit or working-hours save fails.

alter table appointments enable row level security;
alter table business_settings enable row level security;
alter table services enable row level security;

-- Appointments
drop policy if exists "Public read appointments" on appointments;
drop policy if exists "Public insert appointments" on appointments;
drop policy if exists "Public update appointments" on appointments;
drop policy if exists "appointments_public_read" on appointments;
drop policy if exists "appointments_public_insert" on appointments;
drop policy if exists "appointments_authenticated_update" on appointments;

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

-- Business settings
drop policy if exists "Public read business_settings" on business_settings;
drop policy if exists "Authenticated update business_settings" on business_settings;
drop policy if exists "business_settings_public_read" on business_settings;
drop policy if exists "business_settings_authenticated_update" on business_settings;

create policy "business_settings_public_read"
  on business_settings for select
  using (true);

create policy "business_settings_authenticated_update"
  on business_settings for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Services (ensure active-only public read remains)
drop policy if exists "services_public_read_active" on services;

create policy "services_public_read_active"
  on services for select
  to anon
  using (is_active = true);
