import { describe, expect, it } from "vitest";
import {
  buildManualWhatsAppLinkForAppointment,
  buildWhatsAppActionNotice,
  isWhatsAppMissingCredentials,
} from "@/lib/appointment-whatsapp-manual";
import type { Appointment, BusinessSettings, Service } from "@/lib/types";

const businessSettings: Pick<BusinessSettings, "businessName"> = {
  businessName: "סטודיו יופי",
};

const services: Service[] = [
  {
    id: "service-1",
    name: "טיפול צבע",
    description: "",
    price: 120,
    durationMinutes: 90,
    isActive: true,
  },
];

const appointment: Pick<
  Appointment,
  "id" | "serviceId" | "customerPhone" | "appointmentDate" | "startTime"
> = {
  id: "appt-1",
  serviceId: "service-1",
  customerPhone: "050-123-4567",
  appointmentDate: "2026-06-22",
  startTime: "10:00",
};

describe("isWhatsAppMissingCredentials", () => {
  it("detects missing credentials reason", () => {
    expect(
      isWhatsAppMissingCredentials({ errorCode: "missing_credentials" })
    ).toBe(true);
    expect(isWhatsAppMissingCredentials({ reason: "missing_credentials" })).toBe(
      true
    );
    expect(isWhatsAppMissingCredentials({ reason: "provider_error" })).toBe(
      false
    );
  });

  it("detects missing credentials from error text", () => {
    expect(
      isWhatsAppMissingCredentials({
        error: "WhatsApp notifications require Supabase configuration.",
      })
    ).toBe(true);
  });
});

describe("buildManualWhatsAppLinkForAppointment", () => {
  it("builds a wa.me link with the same message as automated WhatsApp", () => {
    const link = buildManualWhatsAppLinkForAppointment(
      appointment,
      "confirmed",
      services,
      businessSettings,
      "https://booklyflow.example"
    );

    expect(link).toContain("https://wa.me/972501234567");
    expect(decodeURIComponent(link?.split("text=")[1] ?? "")).toContain(
      "סטודיו יופי"
    );
    expect(decodeURIComponent(link?.split("text=")[1] ?? "")).toContain(
      "נשמח לראותך!"
    );
  });

  it("includes review link for review_request events", () => {
    const link = buildManualWhatsAppLinkForAppointment(
      appointment,
      "review_request",
      services,
      businessSettings,
      "https://booklyflow.example"
    );

    expect(decodeURIComponent(link?.split("text=")[1] ?? "")).toContain(
      "https://booklyflow.example/review/appt-1"
    );
  });
});

describe("buildWhatsAppActionNotice", () => {
  it("returns success notice when automated WhatsApp succeeds", () => {
    const notice = buildWhatsAppActionNotice(
      appointment,
      "confirmed",
      { success: true, eventType: "confirmed" },
      services,
      businessSettings,
      "https://booklyflow.example"
    );

    expect(notice.type).toBe("success");
    expect(notice.message).toContain("נשלחה הודעת WhatsApp");
    expect(notice.manualWhatsAppHref).toBeUndefined();
  });

  it("returns manual fallback notice when credentials are missing", () => {
    const notice = buildWhatsAppActionNotice(
      appointment,
      "confirmed",
      {
        success: false,
        reason: "missing_credentials",
        error: "WhatsApp provider is not configured.",
        eventType: "confirmed",
      },
      services,
      businessSettings,
      "https://booklyflow.example"
    );

    expect(notice.type).toBe("warning");
    expect(notice.message).toBe("הפעולה נשמרה, אך WhatsApp אוטומטי לא מוגדר");
    expect(notice.manualWhatsAppHref).toContain("https://wa.me/972501234567");
  });

  it("returns generic failure notice for provider errors with manual link", () => {
    const notice = buildWhatsAppActionNotice(
      appointment,
      "confirmed",
      {
        success: false,
        errorCode: "provider_error",
        reason: "provider_error",
        error: "Twilio error",
        eventType: "confirmed",
      },
      services,
      businessSettings,
      "https://booklyflow.example"
    );

    expect(notice.type).toBe("warning");
    expect(notice.message).toBe(
      "הפעולה נשמרה, אך שליחת הודעת ה-WhatsApp נכשלה"
    );
    expect(notice.manualWhatsAppHref).toContain("https://wa.me/972501234567");
  });
});
