-- BooklyFlow migration: appointment notification tracking (SMS events)
-- Run in Supabase SQL Editor for customer SMS event history.

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

alter table appointment_notifications enable row level security;

drop policy if exists "appointment_notifications_authenticated_insert"
  on appointment_notifications;
drop policy if exists "appointment_notifications_authenticated_read"
  on appointment_notifications;

create policy "appointment_notifications_authenticated_insert"
  on appointment_notifications for insert
  to authenticated
  with check (auth.role() = 'authenticated');

create policy "appointment_notifications_authenticated_read"
  on appointment_notifications for select
  to authenticated
  using (auth.role() = 'authenticated');
