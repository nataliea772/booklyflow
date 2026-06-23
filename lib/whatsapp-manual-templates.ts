import { formatTimeLabel } from "@/lib/availability";
import { getPublicBusinessName } from "@/lib/business-config";
import { addDaysToDateString, getTodayDateString } from "@/lib/dates";
import { formatDisplayDate } from "@/lib/i18n";
import { buildReviewLink } from "@/lib/review-links";
import { buildManualWhatsAppLink } from "@/lib/whatsapp-manual-links";
import type { Appointment, BusinessSettings, Service } from "@/lib/types";

export type WhatsAppManualTemplateType =
  | "confirmation"
  | "reminder"
  | "review_request"
  | "general";

export const WHATSAPP_MANUAL_TEMPLATE_LABELS: Record<
  WhatsAppManualTemplateType,
  string
> = {
  confirmation: "אישור תור",
  reminder: "תזכורת לפני תור",
  review_request: "בקשת ביקורת",
  general: "הודעה כללית",
};

export function buildWhatsAppManualTemplateMessage(
  templateType: WhatsAppManualTemplateType,
  appointment: Pick<
    Appointment,
    "id" | "customerName" | "appointmentDate" | "startTime"
  >,
  service: Pick<Service, "name">,
  businessSettings: Pick<BusinessSettings, "businessName">,
  siteOrigin?: string
): string {
  const businessName = getPublicBusinessName(businessSettings);
  const customerName = appointment.customerName.trim();
  const date = formatDisplayDate(appointment.appointmentDate);
  const time = formatTimeLabel(appointment.startTime);
  const tomorrow = addDaysToDateString(getTodayDateString(), 1);
  const isTomorrow = appointment.appointmentDate === tomorrow;

  switch (templateType) {
    case "confirmation":
      return `התור שלך ב-${businessName} אושר לתאריך ${date} בשעה ${time}. נשמח לראותך!`;
    case "reminder":
      return isTomorrow
        ? `היי ${customerName}, מזכירים לך שהתור שלך ב-${businessName} נקבע למחר בשעה ${time}. נתראה!`
        : `היי ${customerName}, מזכירים לך שהתור שלך ב-${businessName} נקבע לתאריך ${date} בשעה ${time}. נתראה!`;
    case "review_request": {
      const reviewLink = buildReviewLink(appointment.id, siteOrigin);
      return `תודה שביקרת ב-${businessName}! נשמח לשמוע איך הייתה החוויה שלך עבור התור: ${service.name}. לדירוג: ${reviewLink}`;
    }
    case "general":
      return `היי ${customerName}, כאן ${businessName}. נשמח לעזור בכל שאלה.`;
  }
}

export function buildWhatsAppManualTemplateLink(
  templateType: WhatsAppManualTemplateType,
  appointment: Pick<
    Appointment,
    "id" | "customerName" | "customerPhone" | "appointmentDate" | "startTime"
  >,
  service: Pick<Service, "name">,
  businessSettings: Pick<BusinessSettings, "businessName">,
  siteOrigin?: string
): string | null {
  const phone = appointment.customerPhone?.trim();
  if (!phone) {
    return null;
  }

  const message = buildWhatsAppManualTemplateMessage(
    templateType,
    appointment,
    service,
    businessSettings,
    siteOrigin
  );

  return buildManualWhatsAppLink(phone, message);
}

export function hasCustomerPhoneForWhatsApp(
  appointment: Pick<Appointment, "customerPhone">
): boolean {
  return Boolean(appointment.customerPhone?.trim());
}
