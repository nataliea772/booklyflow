-- BooklyFlow migration: services RLS for admin CRUD
-- Run in Supabase SQL Editor if service edit/deactivate/reactivate fails.
--
-- Fixes: update returning zero rows when SELECT policies block inactive services
-- or when authenticated users lack explicit read/update policies.

alter table services enable row level security;

-- Remove legacy policy names (schema.sql + earlier migrations)
drop policy if exists "Public read services" on services;
drop policy if exists "Authenticated insert services" on services;
drop policy if exists "Authenticated update services" on services;
drop policy if exists "services_public_read_active" on services;
drop policy if exists "services_authenticated_read_all" on services;
drop policy if exists "services_authenticated_insert" on services;
drop policy if exists "services_authenticated_update" on services;

-- Anonymous visitors (public booking): active services only
create policy "services_public_read_active"
  on services for select
  to anon
  using (is_active = true);

-- Authenticated admins: read all services including inactive
create policy "services_authenticated_read_all"
  on services for select
  to authenticated
  using (auth.role() = 'authenticated');

-- Authenticated admins: create services
create policy "services_authenticated_insert"
  on services for insert
  to authenticated
  with check (auth.role() = 'authenticated');

-- Authenticated admins: update services (includes is_active deactivate/reactivate)
create policy "services_authenticated_update"
  on services for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- No DELETE policy: use soft delete (is_active = false) instead.
