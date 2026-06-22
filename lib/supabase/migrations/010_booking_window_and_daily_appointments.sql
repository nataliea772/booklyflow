-- BooklyFlow migration: booking window (how far ahead customers can book)
-- Run in Supabase SQL Editor.

alter table business_settings
  add column if not exists booking_window_days integer default 30;

update business_settings
set booking_window_days = 30
where booking_window_days is null;
