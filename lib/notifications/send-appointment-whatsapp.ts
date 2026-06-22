import { isAuthRequired } from "@/lib/supabase/auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { WhatsAppEventType } from "@/lib/server/whatsapp";

export type SendAppointmentWhatsAppResult = {
  success: boolean;
  error?: string;
  eventType?: WhatsAppEventType;
};

export async function sendAppointmentWhatsApp(
  appointmentId: string,
  eventType: WhatsAppEventType
): Promise<SendAppointmentWhatsAppResult> {
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
    const response = await fetch("/api/notifications/whatsapp", {
      method: "POST",
      headers,
      body: JSON.stringify({ appointmentId, eventType }),
    });

    const payload = (await response.json()) as SendAppointmentWhatsAppResult;

    if (!response.ok) {
      return {
        success: false,
        error: payload.error ?? "Failed to send appointment WhatsApp.",
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
          : "Failed to send appointment WhatsApp.",
      eventType,
    };
  }
}
