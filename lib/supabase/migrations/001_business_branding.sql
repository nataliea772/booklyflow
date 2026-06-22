-- BooklyFlow migration: business branding + service images + storage
-- Run in Supabase SQL Editor after the base schema.

-- Business settings branding columns
alter table business_settings
  add column if not exists description text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists logo_url text,
  add column if not exists cover_image_url text,
  add column if not exists primary_color text;

-- Service image column
alter table services
  add column if not exists image_url text;

-- Allow authenticated admins to update business settings
create policy "Authenticated update business_settings"
  on business_settings for update
  to authenticated
  using (true)
  with check (true);

-- Supabase Storage: booklyflow-assets bucket
-- Dashboard: Storage → New bucket → name "booklyflow-assets" → Public bucket: ON
insert into storage.buckets (id, name, public)
values ('booklyflow-assets', 'booklyflow-assets', true)
on conflict (id) do update set public = true;

-- Public read for all files in the bucket
create policy "Public read booklyflow assets"
  on storage.objects for select
  using (bucket_id = 'booklyflow-assets');

-- Authenticated users can upload
create policy "Authenticated upload booklyflow assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'booklyflow-assets');

-- Authenticated users can update their uploads
create policy "Authenticated update booklyflow assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'booklyflow-assets')
  with check (bucket_id = 'booklyflow-assets');

-- Authenticated users can delete files
create policy "Authenticated delete booklyflow assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'booklyflow-assets');
