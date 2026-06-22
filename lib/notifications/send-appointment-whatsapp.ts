import { isAuthRequired } from "@/lib/supabase/auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { WhatsAppEventType } from "@/lib/whatsapp-messages";

export type WhatsAppNotificationReason =
  | "missing_credentials"
  | "provider_error";

export type SendAppointmentWhatsAppResult = {
  success: boolean;
  error?: string;
  message?: string;
  eventType?: WhatsAppEventType;
  errorCode?: WhatsAppNotificationReason;
  /** @deprecated Use errorCode */
  reason?: WhatsAppNotificationReason;
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
    const errorCode = payload.errorCode ?? payload.reason;

    if (!response.ok) {
      return {
        success: false,
        error: payload.error ?? payload.message ?? "Failed to send appointment WhatsApp.",
        message: payload.message,
        eventType,
        errorCode,
        reason: errorCode,
      };
    }

    return {
      ...payload,
      errorCode,
      reason: errorCode,
    };
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
