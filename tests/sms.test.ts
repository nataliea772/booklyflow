import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildAppointmentConfirmedMessage,
  buildAppointmentSmsMessage,
  isSmsConfigured,
  normalizePhoneNumber,
  sendSms,
} from "@/lib/server/sms";
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

describe("buildAppointmentSmsMessage", () => {
  it("builds a Hebrew confirmation message with business, date, and time", () => {
    const message = buildAppointmentSmsMessage(
      "confirmed",
      appointment,
      service,
      businessSettings
    );

    expect(message).toContain("סטודיו יופי");
    expect(message).toMatch(/אושר לתאריך .+ בשעה 10:00\./);
    expect(message).not.toContain("נשמח לראותך");
  });

  it("builds a Hebrew cancellation message", () => {
    const message = buildAppointmentSmsMessage(
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
    const message = buildAppointmentSmsMessage(
      "rescheduled",
      appointment,
      service,
      businessSettings
    );

    expect(message).toContain("סטודיו יופי");
    expect(message).toMatch(/עודכן לתאריך .+ בשעה 10:00\./);
  });
});

describe("buildAppointmentConfirmedMessage", () => {
  it("delegates to the confirmed SMS message builder", () => {
    const message = buildAppointmentConfirmedMessage(
      appointment,
      service,
      businessSettings
    );

    expect(message).toBe(
      buildAppointmentSmsMessage(
        "confirmed",
        appointment,
        service,
        businessSettings
      )
    );
  });
});

describe("normalizePhoneNumber", () => {
  it("converts Israeli local numbers to E.164", () => {
    expect(normalizePhoneNumber("050-123-4567")).toBe("+972501234567");
  });

  it("keeps numbers that already include country code", () => {
    expect(normalizePhoneNumber("+972501234567")).toBe("+972501234567");
  });
});

describe("sendSms", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns a configuration error when SMS provider is missing", async () => {
    delete process.env.SMS_PROVIDER;

    const result = await sendSms("0501234567", "בדיקה");

    expect(result.success).toBe(false);
    expect(result.error).toContain("not configured");
    expect(isSmsConfigured()).toBe(false);
  });

  it("returns a configuration error when Twilio credentials are incomplete", async () => {
    process.env.SMS_PROVIDER = "twilio";
    process.env.SMS_ACCOUNT_SID = "AC123";
    delete process.env.SMS_AUTH_TOKEN;
    delete process.env.SMS_FROM_NUMBER;

    const result = await sendSms("0501234567", "בדיקה");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Twilio credentials");
    expect(isSmsConfigured()).toBe(false);
  });

  it("sends SMS via Twilio when credentials are configured", async () => {
    process.env.SMS_PROVIDER = "twilio";
    process.env.SMS_ACCOUNT_SID = "AC123";
    process.env.SMS_AUTH_TOKEN = "secret-token";
    process.env.SMS_FROM_NUMBER = "+15551234567";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(isSmsConfigured()).toBe(true);

    const result = await sendSms("0501234567", "הודעת בדיקה");

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/Accounts/AC123/Messages.json");
    expect(options.method).toBe("POST");
    expect(String(options.body)).toContain("To=%2B972501234567");
    expect(String(options.body)).toContain("Body=");
    expect(String(options.body)).toContain("%D7%94%D7%95%D7%93%D7%A2%D7%AA");
  });

  it("returns Twilio API errors without throwing", async () => {
    process.env.SMS_PROVIDER = "twilio";
    process.env.SMS_ACCOUNT_SID = "AC123";
    process.env.SMS_AUTH_TOKEN = "secret-token";
    process.env.SMS_FROM_NUMBER = "+15551234567";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "Invalid phone number",
      })
    );

    const result = await sendSms("0501234567", "בדיקה");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Twilio error (400)");
  });
});
