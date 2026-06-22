-- BooklyFlow migration: allow authenticated admins to delete services
-- Run in Supabase SQL Editor if service delete fails.
-- Safe delete (no linked appointments) is enforced in the app before delete.

alter table services enable row level security;

drop policy if exists "services_authenticated_delete" on services;

create policy "services_authenticated_delete"
  on services for delete
  to authenticated
  using (auth.role() = 'authenticated');
