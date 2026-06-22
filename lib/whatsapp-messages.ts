import { formatTimeLabel } from "@/lib/availability";
import { getPublicBusinessName } from "@/lib/business-config";
import { formatDisplayDate } from "@/lib/i18n";
import type { Appointment, BusinessSettings, Service } from "@/lib/types";

export type WhatsAppEventType =
  | "confirmed"
  | "cancelled"
  | "rescheduled"
  | "review_request";

export function buildAppointmentWhatsAppMessage(
  eventType: WhatsAppEventType,
  appointment: Pick<Appointment, "appointmentDate" | "startTime">,
  service: Pick<Service, "name">,
  businessSettings: Pick<BusinessSettings, "businessName">,
  reviewLink?: string
): string {
  const businessName = getPublicBusinessName(businessSettings);
  const date = formatDisplayDate(appointment.appointmentDate);
  const time = formatTimeLabel(appointment.startTime);

  switch (eventType) {
    case "confirmed":
      return `התור שלך ב-${businessName} אושר לתאריך ${date} בשעה ${time}. נשמח לראותך!`;
    case "cancelled":
      return `התור שלך ב-${businessName} לתאריך ${date} בשעה ${time} בוטל. לפרטים נוספים ניתן ליצור קשר עם העסק.`;
    case "rescheduled":
      return `התור שלך ב-${businessName} עודכן לתאריך ${date} בשעה ${time}.`;
    case "review_request": {
      if (!reviewLink) {
        throw new Error("reviewLink is required for review_request WhatsApp.");
      }

      return `תודה שביקרת ב-${businessName}! נשמח לשמוע איך הייתה החוויה שלך עבור התור: ${service.name}. לדירוג: ${reviewLink}`;
    }
  }
}
