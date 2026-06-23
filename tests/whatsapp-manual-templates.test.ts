import { describe, expect, it } from "vitest";
import {
  buildWhatsAppManualTemplateLink,
  buildWhatsAppManualTemplateMessage,
  hasCustomerPhoneForWhatsApp,
} from "@/lib/whatsapp-manual-templates";

const appointment = {
  id: "apt-1",
  customerName: "נועה",
  customerPhone: "050-1234567",
  appointmentDate: "2026-06-23",
  startTime: "10:00",
};

const service = { name: "ייעוץ" };
const businessSettings = { businessName: "BooklyFlow Studio" };

describe("buildWhatsAppManualTemplateMessage", () => {
  it("builds confirmation message", () => {
    const message = buildWhatsAppManualTemplateMessage(
      "confirmation",
      appointment,
      service,
      businessSettings
    );

    expect(message).toContain("אושר");
    expect(message).toContain("BooklyFlow Studio");
  });

  it("builds reminder message with customer name", () => {
    const message = buildWhatsAppManualTemplateMessage(
      "reminder",
      appointment,
      service,
      businessSettings
    );

    expect(message).toContain("נועה");
    expect(message).toContain("מזכירים");
  });

  it("builds review request with link", () => {
    const message = buildWhatsAppManualTemplateMessage(
      "review_request",
      appointment,
      service,
      businessSettings,
      "https://example.com"
    );

    expect(message).toContain("ייעוץ");
    expect(message).toContain("/review/apt-1");
  });

  it("builds general message", () => {
    const message = buildWhatsAppManualTemplateMessage(
      "general",
      appointment,
      service,
      businessSettings
    );

    expect(message).toContain("נועה");
    expect(message).toContain("BooklyFlow Studio");
  });
});

describe("buildWhatsAppManualTemplateLink", () => {
  it("returns wa.me link when phone exists", () => {
    const href = buildWhatsAppManualTemplateLink(
      "general",
      appointment,
      service,
      businessSettings
    );

    expect(href).toMatch(/^https:\/\/wa\.me\//);
  });

  it("returns null when phone is missing", () => {
    const href = buildWhatsAppManualTemplateLink(
      "general",
      { ...appointment, customerPhone: "" },
      service,
      businessSettings
    );

    expect(href).toBeNull();
  });
});

describe("hasCustomerPhoneForWhatsApp", () => {
  it("returns false for empty phone", () => {
    expect(hasCustomerPhoneForWhatsApp({ customerPhone: "  " })).toBe(false);
  });
});
