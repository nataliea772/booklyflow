-- BooklyFlow migration: WhatsApp notification channel default
-- Run in Supabase SQL Editor.

alter table appointment_notifications
  alter column channel set default 'whatsapp';

comment on column appointment_notifications.channel is
  'Notification channel, e.g. whatsapp';
