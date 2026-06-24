import { findService } from "@/lib/availability";
import { buildReviewLink } from "@/lib/review-links";
import { hasCustomerPhoneForWhatsApp } from "@/lib/whatsapp-manual-templates";
import { buildManualWhatsAppLink } from "@/lib/whatsapp-manual-links";
import {
  buildAppointmentWhatsAppMessage,
  type WhatsAppEventType,
} from "@/lib/whatsapp-messages";
import type { Appointment, BusinessSettings, Service } from "@/lib/types";
import type { SendAppointmentWhatsAppResult } from "@/lib/notifications/send-appointment-whatsapp";

export type WhatsAppManualModalContent = {
  description: string;
  whatsappLink?: string;
};

export type WhatsAppActionOutcome = {
  successMessage?: string;
  manualModal?: WhatsAppManualModalContent;
};

/** @deprecated Use WhatsAppActionOutcome */
export type WhatsAppActionNotice = WhatsAppActionOutcome;

export const MANUAL_WHATSAPP_MODAL_TITLE = "שליחה ב-WhatsApp";

export const MISSING_CUSTOMER_PHONE_MESSAGE = "אין מספר טלפון ללקוחה";

export const MANUAL_WHATSAPP_MODAL_DESCRIPTIONS: Record<
  WhatsAppEventType,
  string
> = {
  confirmed: "התור אושר. אפשר לשלוח ללקוחה הודעת אישור ב-WhatsApp.",
  cancelled: "התור בוטל. אפשר לשלוח ללקוחה עדכון ב-WhatsApp.",
  rescheduled: "התור עודכן. אפשר לשלוח ללקוחה הודעת עדכון ב-WhatsApp.",
  review_request:
    "התור סומן כהושלם. אפשר לשלוח ללקוחה קישור לביקורת ב-WhatsApp.",
};

const SUCCESS_MESSAGES: Record<WhatsAppEventType, string> = {
  confirmed: "התור אושר ונשלחה הודעת WhatsApp",
  cancelled: "התור בוטל ונשלחה הודעת WhatsApp",
  rescheduled: "התור עודכן ונשלחה הודעת WhatsApp",
  review_request: "התור סומן כהושלם ונשלח קישור ביקורת ב-WhatsApp",
};

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
  if (!hasCustomerPhoneForWhatsApp(appointment)) {
    return null;
  }

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

export function buildManualWhatsAppModalContent(
  appointment: Pick<
    Appointment,
    "id" | "serviceId" | "customerPhone" | "appointmentDate" | "startTime"
  >,
  eventType: WhatsAppEventType,
  services: Service[],
  businessSettings: Pick<BusinessSettings, "businessName">,
  siteOrigin?: string
): WhatsAppManualModalContent {
  if (!hasCustomerPhoneForWhatsApp(appointment)) {
    return {
      description: MISSING_CUSTOMER_PHONE_MESSAGE,
    };
  }

  const whatsappLink = buildManualWhatsAppLinkForAppointment(
    appointment,
    eventType,
    services,
    businessSettings,
    siteOrigin
  );

  return {
    description: MANUAL_WHATSAPP_MODAL_DESCRIPTIONS[eventType],
    whatsappLink: whatsappLink ?? undefined,
  };
}

export function buildWhatsAppActionOutcome(
  appointment: Pick<
    Appointment,
    "id" | "serviceId" | "customerPhone" | "appointmentDate" | "startTime"
  >,
  eventType: WhatsAppEventType,
  whatsAppResult: SendAppointmentWhatsAppResult,
  services: Service[],
  businessSettings: Pick<BusinessSettings, "businessName">,
  siteOrigin?: string
): WhatsAppActionOutcome {
  if (whatsAppResult.success) {
    return {
      successMessage: SUCCESS_MESSAGES[eventType],
    };
  }

  if (
    process.env.NODE_ENV === "development" &&
    isWhatsAppMissingCredentials(whatsAppResult)
  ) {
    console.info(
      "[BooklyFlow] Automated WhatsApp is not configured; opening manual WhatsApp modal."
    );
  } else if (process.env.NODE_ENV === "development") {
    console.info(
      "[BooklyFlow] Automated WhatsApp failed; opening manual WhatsApp modal.",
      whatsAppResult.error ?? whatsAppResult.reason
    );
  }

  return {
    manualModal: buildManualWhatsAppModalContent(
      appointment,
      eventType,
      services,
      businessSettings,
      siteOrigin
    ),
  };
}

/** @deprecated Use buildWhatsAppActionOutcome */
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
): WhatsAppActionOutcome {
  return buildWhatsAppActionOutcome(
    appointment,
    eventType,
    whatsAppResult,
    services,
    businessSettings,
    siteOrigin
  );
}
