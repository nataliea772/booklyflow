-- BooklyFlow migration: allow admin to delete cancelled/completed appointments
--
-- appointment_notifications.appointment_id already uses ON DELETE CASCADE (009).
-- customer_reviews.appointment_id uses ON DELETE SET NULL so deleting an appointment
-- removes the link but preserves submitted review content when present.

alter table customer_reviews
  drop constraint if exists customer_reviews_appointment_id_fkey;

alter table customer_reviews
  add constraint customer_reviews_appointment_id_fkey
  foreign key (appointment_id)
  references appointments(id)
  on delete set null;

drop policy if exists "appointments_authenticated_delete" on appointments;

create policy "appointments_authenticated_delete"
  on appointments for delete
  to authenticated
  using (auth.role() = 'authenticated');
