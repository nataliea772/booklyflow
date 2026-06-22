-- BooklyFlow migration: customer reviews for public display
-- Run in Supabase SQL Editor.

create table if not exists customer_reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  is_visible boolean default true,
  created_at timestamptz default now()
);

alter table customer_reviews enable row level security;

drop policy if exists "customer_reviews_public_read_visible"
  on customer_reviews;
drop policy if exists "customer_reviews_authenticated_read_all"
  on customer_reviews;
drop policy if exists "customer_reviews_authenticated_insert"
  on customer_reviews;
drop policy if exists "customer_reviews_authenticated_update"
  on customer_reviews;
drop policy if exists "customer_reviews_authenticated_delete"
  on customer_reviews;

create policy "customer_reviews_public_read_visible"
  on customer_reviews for select
  using (is_visible = true);

create policy "customer_reviews_authenticated_read_all"
  on customer_reviews for select
  to authenticated
  using (auth.role() = 'authenticated');

create policy "customer_reviews_authenticated_insert"
  on customer_reviews for insert
  to authenticated
  with check (auth.role() = 'authenticated');

create policy "customer_reviews_authenticated_update"
  on customer_reviews for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "customer_reviews_authenticated_delete"
  on customer_reviews for delete
  to authenticated
  using (auth.role() = 'authenticated');
