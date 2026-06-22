-- BooklyFlow migration: per-day working hours + blocked times admin policies
-- Run in Supabase SQL Editor for advanced scheduling.

alter table business_settings
  add column if not exists working_hours jsonb;

alter table blocked_times enable row level security;

alter table blocked_times
  add column if not exists is_full_day boolean default false;

alter table blocked_times
  alter column start_time drop not null;

alter table blocked_times
  alter column end_time drop not null;

drop policy if exists "Public read blocked_times" on blocked_times;
drop policy if exists "blocked_times_public_read" on blocked_times;
drop policy if exists "blocked_times_authenticated_insert" on blocked_times;
drop policy if exists "blocked_times_authenticated_update" on blocked_times;
drop policy if exists "blocked_times_authenticated_delete" on blocked_times;

create policy "blocked_times_public_read"
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
