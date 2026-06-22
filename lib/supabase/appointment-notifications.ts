import type { SupabaseClient } from "@supabase/supabase-js";
import type { SmsEventType } from "@/lib/server/sms";

export type AppointmentNotificationRecord = {
  appointmentId: string;
  eventType: SmsEventType;
  channel?: string;
  status: "sent" | "failed";
  error?: string | null;
};

export async function recordAppointmentNotification(
  supabase: SupabaseClient,
  input: AppointmentNotificationRecord
): Promise<void> {
  const { error } = await supabase.from("appointment_notifications").insert({
    appointment_id: input.appointmentId,
    event_type: input.eventType,
    channel: input.channel ?? "sms",
    status: input.status,
    error: input.error?.trim() || null,
  });

  if (error) {
    console.error("Failed to record appointment notification:", error.message);
  }
}
