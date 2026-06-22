import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildAppointmentWhatsAppMessage,
  isWhatsAppConfigured,
  normalizeWhatsAppNumber,
  sendWhatsAppMessage,
} from "@/lib/server/whatsapp";
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

    expect(message).toContain("סטודיו יופי");
    expect(message).toContain("10:00");
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

    expect(message).toContain("סטודיו יופי");
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

    expect(message).toContain("סטודיו יופי");
    expect(message).toContain("טיפול צבע");
    expect(message).toContain("לדירוג:");
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

describe("normalizeWhatsAppNumber", () => {
  it("converts Israeli local numbers to E.164", () => {
    expect(normalizeWhatsAppNumber("050-123-4567")).toBe("+972501234567");
  });

  it("keeps numbers that already include country code", () => {
    expect(normalizeWhatsAppNumber("+972501234567")).toBe("+972501234567");
  });
});

describe("sendWhatsAppMessage", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns a configuration error when WhatsApp provider is missing", async () => {
    delete process.env.WHATSAPP_PROVIDER;

    const result = await sendWhatsAppMessage("0501234567", "בדיקה");

    expect(result.success).toBe(false);
    expect(result.error).toContain("not configured");
    expect(isWhatsAppConfigured()).toBe(false);
  });

  it("returns a configuration error when Twilio credentials are incomplete", async () => {
    process.env.WHATSAPP_PROVIDER = "twilio";
    process.env.WHATSAPP_ACCOUNT_SID = "AC123";
    delete process.env.WHATSAPP_AUTH_TOKEN;
    delete process.env.WHATSAPP_FROM_NUMBER;

    const result = await sendWhatsAppMessage("0501234567", "בדיקה");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Twilio WhatsApp credentials");
    expect(isWhatsAppConfigured()).toBe(false);
  });

  it("sends WhatsApp via Twilio when credentials are configured", async () => {
    process.env.WHATSAPP_PROVIDER = "twilio";
    process.env.WHATSAPP_ACCOUNT_SID = "AC123";
    process.env.WHATSAPP_AUTH_TOKEN = "secret-token";
    process.env.WHATSAPP_FROM_NUMBER = "+14155238886";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(isWhatsAppConfigured()).toBe(true);

    const result = await sendWhatsAppMessage("0501234567", "הודעת בדיקה");

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/Accounts/AC123/Messages.json");
    expect(options.method).toBe("POST");
    expect(String(options.body)).toContain("To=whatsapp%3A%2B972501234567");
    expect(String(options.body)).toContain("From=whatsapp%3A");
    expect(String(options.body)).toContain("Body=");
  });

  it("returns Twilio API errors without throwing", async () => {
    process.env.WHATSAPP_PROVIDER = "twilio";
    process.env.WHATSAPP_ACCOUNT_SID = "AC123";
    process.env.WHATSAPP_AUTH_TOKEN = "secret-token";
    process.env.WHATSAPP_FROM_NUMBER = "+14155238886";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "Invalid phone number",
      })
    );

    const result = await sendWhatsAppMessage("0501234567", "בדיקה");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Twilio error (400)");
  });
});
