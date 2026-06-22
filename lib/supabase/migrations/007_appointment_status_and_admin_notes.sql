-- BooklyFlow migration: completed status support + internal admin notes
-- Run in Supabase SQL Editor for enhanced appointment management.

alter table appointments
  add column if not exists admin_note text;

-- Status is stored as text without a DB constraint in BooklyFlow.
-- Allowed values: pending, confirmed, cancelled, completed
