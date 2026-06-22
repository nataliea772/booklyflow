-- BooklyFlow migration: SMS notification tracking on appointments
-- Run in Supabase SQL Editor after confirming appointments should send SMS.

alter table appointments
  add column if not exists sms_sent_at timestamptz;

alter table appointments
  add column if not exists sms_error text;
