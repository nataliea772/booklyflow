-- BooklyFlow migration: blocked time date ranges
-- Run in Supabase SQL Editor for vacation / multi-day unavailable periods.

alter table blocked_times
  add column if not exists start_date date;

alter table blocked_times
  add column if not exists end_date date;

update blocked_times
set
  start_date = coalesce(start_date, blocked_date),
  end_date = coalesce(end_date, blocked_date, start_date)
where blocked_date is not null;

update blocked_times
set
  start_date = coalesce(start_date, end_date),
  end_date = coalesce(end_date, start_date)
where start_date is null
   or end_date is null;

alter table blocked_times
  alter column is_full_day set default true;
