import { describe, expect, it } from "vitest";
import {
  buildManualWhatsAppLinkForAppointment,
  buildManualWhatsAppModalContent,
  buildWhatsAppActionOutcome,
  isWhatsAppMissingCredentials,
  MANUAL_WHATSAPP_MODAL_DESCRIPTIONS,
  MANUAL_WHATSAPP_MODAL_TITLE,
  MISSING_CUSTOMER_PHONE_MESSAGE,
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

const TECHNICAL_WARNING_PHRASES = [
  "WhatsApp אוטומטי לא מוגדר",
  "שליחת הודעת ה-WhatsApp נכשלה",
  "missing_credentials",
];

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

  it("returns null when customer phone is missing", () => {
    const link = buildManualWhatsAppLinkForAppointment(
      { ...appointment, customerPhone: "  " },
      "confirmed",
      services,
      businessSettings,
      "https://booklyflow.example"
    );

    expect(link).toBeNull();
  });
});

describe("buildManualWhatsAppModalContent", () => {
  it("returns action-specific friendly descriptions", () => {
    expect(
      buildManualWhatsAppModalContent(
        appointment,
        "confirmed",
        services,
        businessSettings,
        "https://booklyflow.example"
      ).description
    ).toBe(MANUAL_WHATSAPP_MODAL_DESCRIPTIONS.confirmed);

    expect(
      buildManualWhatsAppModalContent(
        appointment,
        "cancelled",
        services,
        businessSettings,
        "https://booklyflow.example"
      ).description
    ).toBe(MANUAL_WHATSAPP_MODAL_DESCRIPTIONS.cancelled);
  });

  it("returns missing phone message without a link", () => {
    const content = buildManualWhatsAppModalContent(
      { ...appointment, customerPhone: "" },
      "confirmed",
      services,
      businessSettings,
      "https://booklyflow.example"
    );

    expect(content.description).toBe(MISSING_CUSTOMER_PHONE_MESSAGE);
    expect(content.whatsappLink).toBeUndefined();
  });

  it("does not include technical warning copy", () => {
    const content = buildManualWhatsAppModalContent(
      appointment,
      "confirmed",
      services,
      businessSettings,
      "https://booklyflow.example"
    );

    for (const phrase of TECHNICAL_WARNING_PHRASES) {
      expect(content.description).not.toContain(phrase);
    }
  });
});

describe("buildWhatsAppActionOutcome", () => {
  it("returns success message when automated WhatsApp succeeds", () => {
    const outcome = buildWhatsAppActionOutcome(
      appointment,
      "confirmed",
      { success: true, eventType: "confirmed" },
      services,
      businessSettings,
      "https://booklyflow.example"
    );

    expect(outcome.successMessage).toContain("נשלחה הודעת WhatsApp");
    expect(outcome.manualModal).toBeUndefined();
  });

  it("returns manual modal content when credentials are missing", () => {
    const outcome = buildWhatsAppActionOutcome(
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

    expect(outcome.successMessage).toBeUndefined();
    expect(outcome.manualModal?.description).toBe(
      MANUAL_WHATSAPP_MODAL_DESCRIPTIONS.confirmed
    );
    expect(outcome.manualModal?.whatsappLink).toContain(
      "https://wa.me/972501234567"
    );

    for (const phrase of TECHNICAL_WARNING_PHRASES) {
      expect(outcome.manualModal?.description).not.toContain(phrase);
    }
  });

  it("returns manual modal content for provider errors with manual link", () => {
    const outcome = buildWhatsAppActionOutcome(
      appointment,
      "rescheduled",
      {
        success: false,
        errorCode: "provider_error",
        reason: "provider_error",
        error: "Twilio error",
        eventType: "rescheduled",
      },
      services,
      businessSettings,
      "https://booklyflow.example"
    );

    expect(outcome.manualModal?.description).toBe(
      MANUAL_WHATSAPP_MODAL_DESCRIPTIONS.rescheduled
    );
    expect(outcome.manualModal?.whatsappLink).toContain(
      "https://wa.me/972501234567"
    );
  });

  it("returns missing phone modal when customer phone is absent", () => {
    const outcome = buildWhatsAppActionOutcome(
      { ...appointment, customerPhone: "" },
      "review_request",
      {
        success: false,
        reason: "missing_credentials",
        eventType: "review_request",
      },
      services,
      businessSettings,
      "https://booklyflow.example"
    );

    expect(outcome.manualModal?.description).toBe(MISSING_CUSTOMER_PHONE_MESSAGE);
    expect(outcome.manualModal?.whatsappLink).toBeUndefined();
  });
});

describe("MANUAL_WHATSAPP_MODAL_TITLE", () => {
  it("uses the expected modal title", () => {
    expect(MANUAL_WHATSAPP_MODAL_TITLE).toBe("שליחה ב-WhatsApp");
  });
});
