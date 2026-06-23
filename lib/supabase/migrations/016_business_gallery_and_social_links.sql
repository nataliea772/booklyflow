-- BooklyFlow migration: business photo gallery + Facebook/Instagram links
-- Run in Supabase SQL Editor.

alter table business_settings
  add column if not exists facebook_url text;

alter table business_settings
  add column if not exists instagram_url text;

create table if not exists business_gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text,
  display_order integer default 0,
  is_visible boolean default true,
  created_at timestamptz default now()
);

alter table business_gallery_images enable row level security;

drop policy if exists "business_gallery_public_read_visible"
  on business_gallery_images;
drop policy if exists "business_gallery_authenticated_read_all"
  on business_gallery_images;
drop policy if exists "business_gallery_authenticated_insert"
  on business_gallery_images;
drop policy if exists "business_gallery_authenticated_update"
  on business_gallery_images;
drop policy if exists "business_gallery_authenticated_delete"
  on business_gallery_images;

create policy "business_gallery_public_read_visible"
  on business_gallery_images for select
  using (is_visible = true);

create policy "business_gallery_authenticated_read_all"
  on business_gallery_images for select
  to authenticated
  using (auth.role() = 'authenticated');

create policy "business_gallery_authenticated_insert"
  on business_gallery_images for insert
  to authenticated
  with check (auth.role() = 'authenticated');

create policy "business_gallery_authenticated_update"
  on business_gallery_images for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "business_gallery_authenticated_delete"
  on business_gallery_images for delete
  to authenticated
  using (auth.role() = 'authenticated');
