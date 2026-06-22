import { isAuthRequired } from "@/lib/supabase/auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { SmsEventType } from "@/lib/server/sms";

export type SendAppointmentSmsResult = {
  success: boolean;
  error?: string;
  eventType?: SmsEventType;
};

export async function sendAppointmentSms(
  appointmentId: string,
  eventType: SmsEventType
): Promise<SendAppointmentSmsResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (isAuthRequired()) {
    const supabase = getSupabaseClient();
    const session = supabase
      ? (await supabase.auth.getSession()).data.session
      : null;

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  }

  try {
    const response = await fetch("/api/notifications/sms", {
      method: "POST",
      headers,
      body: JSON.stringify({ appointmentId, eventType }),
    });

    const payload = (await response.json()) as SendAppointmentSmsResult;

    if (!response.ok) {
      return {
        success: false,
        error: payload.error ?? "Failed to send appointment SMS.",
        eventType,
      };
    }

    return payload;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send appointment SMS.",
      eventType,
    };
  }
}

/** @deprecated Use sendAppointmentSms(id, "confirmed") */
export async function sendConfirmationSms(
  appointmentId: string
): Promise<SendAppointmentSmsResult> {
  return sendAppointmentSms(appointmentId, "confirmed");
}
