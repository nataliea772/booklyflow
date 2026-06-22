import { describe, expect, it } from "vitest";
import { buildAppointmentWhatsAppMessage } from "@/lib/whatsapp-messages";
import type { Appointment, BusinessSettings, Service } from "@/lib/types";

const appointment: Pick<Appointment, "appointmentDate" | "startTime"> = {
  appointmentDate: "2026-06-22",
  startTime: "10:00",
};

const service: Pick<Service, "name"> = {
  name: "טיפול צבע",
};

const businessSettings: Pick<BusinessSettings, "businessName"> = {
  businessName: "סטודיו יופי",
};

describe("buildAppointmentWhatsAppMessage", () => {
  it("builds a Hebrew confirmation message with greeting", () => {
    const message = buildAppointmentWhatsAppMessage(
      "confirmed",
      appointment,
      service,
      businessSettings
    );

    expect(message).toContain("סטודיו יופי");
    expect(message).toMatch(/אושר לתאריך .+ בשעה 10:00\./);
    expect(message).toContain("נשמח לראותך!");
  });

  it("builds a Hebrew cancellation message", () => {
    const message = buildAppointmentWhatsAppMessage(
      "cancelled",
      appointment,
      service,
      businessSettings
    );

    expect(message).toContain("בוטל");
    expect(message).toContain("לפרטים נוספים");
  });

  it("builds a Hebrew rescheduled message", () => {
    const message = buildAppointmentWhatsAppMessage(
      "rescheduled",
      appointment,
      service,
      businessSettings
    );

    expect(message).toMatch(/עודכן לתאריך .+ בשעה 10:00\./);
  });

  it("builds a Hebrew review request message with service and link", () => {
    const reviewLink = "https://booklyflow.example/review/appt-1";
    const message = buildAppointmentWhatsAppMessage(
      "review_request",
      appointment,
      service,
      businessSettings,
      reviewLink
    );

    expect(message).toContain("טיפול צבע");
    expect(message).toContain(reviewLink);
  });

  it("requires a review link for review_request messages", () => {
    expect(() =>
      buildAppointmentWhatsAppMessage(
        "review_request",
        appointment,
        service,
        businessSettings
      )
    ).toThrow("reviewLink is required");
  });
});
