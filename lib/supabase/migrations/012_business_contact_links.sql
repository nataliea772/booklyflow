-- BooklyFlow migration: business contact link fields for public quick actions
-- Run in Supabase SQL Editor.

alter table business_settings
  add column if not exists whatsapp_phone text;

alter table business_settings
  add column if not exists location_url text;

alter table business_settings
  add column if not exists waze_url text;
