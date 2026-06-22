import { findService } from "@/lib/availability";
import { buildReviewLink } from "@/lib/review-links";
import { buildManualWhatsAppLink } from "@/lib/whatsapp-manual-links";
import {
  buildAppointmentWhatsAppMessage,
  type WhatsAppEventType,
} from "@/lib/whatsapp-messages";
import type { Appointment, BusinessSettings, Service } from "@/lib/types";
import type { SendAppointmentWhatsAppResult } from "@/lib/notifications/send-appointment-whatsapp";

export type WhatsAppActionNotice = {
  type: "success" | "warning";
  message: string;
  manualWhatsAppHref?: string;
};

const MANUAL_FALLBACK_MESSAGE =
  "הפעולה נשמרה, אך WhatsApp אוטומטי לא מוגדר";

const SUCCESS_MESSAGES: Record<WhatsAppEventType, string> = {
  confirmed: "התור אושר ונשלחה הודעת WhatsApp",
  cancelled: "התור בוטל ונשלחה הודעת WhatsApp",
  rescheduled: "התור עודכן ונשלחה הודעת WhatsApp",
  review_request: "התור סומן כהושלם ונשלח קישור ביקורת ב-WhatsApp",
};

const GENERIC_FAILURE_MESSAGE =
  "הפעולה נשמרה, אך שליחת הודעת ה-WhatsApp נכשלה";

export function isWhatsAppMissingCredentials(
  result: Pick<
    SendAppointmentWhatsAppResult,
    "reason" | "errorCode" | "error"
  >
): boolean {
  if (
    result.errorCode === "missing_credentials" ||
    result.reason === "missing_credentials"
  ) {
    return true;
  }

  const error = result.error?.toLowerCase() ?? "";
  return (
    error.includes("not configured") ||
    error.includes("require supabase configuration")
  );
}

export function buildManualWhatsAppLinkForAppointment(
  appointment: Pick<
    Appointment,
    "id" | "serviceId" | "customerPhone" | "appointmentDate" | "startTime"
  >,
  eventType: WhatsAppEventType,
  services: Service[],
  businessSettings: Pick<BusinessSettings, "businessName">,
  siteOrigin?: string
): string | null {
  const service = findService(services, appointment.serviceId);
  if (!service) {
    return null;
  }

  const reviewLink =
    eventType === "review_request"
      ? buildReviewLink(appointment.id, siteOrigin)
      : undefined;

  const message = buildAppointmentWhatsAppMessage(
    eventType,
    appointment,
    service,
    businessSettings,
    reviewLink
  );

  return buildManualWhatsAppLink(appointment.customerPhone, message);
}

export function buildWhatsAppActionNotice(
  appointment: Pick<
    Appointment,
    "id" | "serviceId" | "customerPhone" | "appointmentDate" | "startTime"
  >,
  eventType: WhatsAppEventType,
  whatsAppResult: SendAppointmentWhatsAppResult,
  services: Service[],
  businessSettings: Pick<BusinessSettings, "businessName">,
  siteOrigin?: string
): WhatsAppActionNotice {
  if (whatsAppResult.success) {
    return {
      type: "success",
      message: SUCCESS_MESSAGES[eventType],
    };
  }

  const manualWhatsAppHref = buildManualWhatsAppLinkForAppointment(
    appointment,
    eventType,
    services,
    businessSettings,
    siteOrigin
  );

  if (isWhatsAppMissingCredentials(whatsAppResult)) {
    return {
      type: "warning",
      message: MANUAL_FALLBACK_MESSAGE,
      manualWhatsAppHref: manualWhatsAppHref ?? undefined,
    };
  }

  return {
    type: "warning",
    message: GENERIC_FAILURE_MESSAGE,
    manualWhatsAppHref: manualWhatsAppHref ?? undefined,
  };
}
