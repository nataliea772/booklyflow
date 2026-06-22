-- BooklyFlow migration: link customer reviews to completed appointments
-- Run in Supabase SQL Editor.

alter table customer_reviews
  add column if not exists appointment_id uuid references appointments(id);

create unique index if not exists customer_reviews_appointment_id_key
  on customer_reviews (appointment_id)
  where appointment_id is not null;

drop policy if exists "customer_reviews_authenticated_insert"
  on customer_reviews;

drop policy if exists "customer_reviews_public_insert"
  on customer_reviews;

create policy "customer_reviews_public_insert"
  on customer_reviews for insert
  with check (appointment_id is not null);

drop policy if exists "customer_reviews_authenticated_update"
  on customer_reviews;

create policy "customer_reviews_authenticated_update"
  on customer_reviews for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
