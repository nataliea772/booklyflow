import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isWhatsAppConfigured,
  normalizeWhatsAppNumber,
  sendWhatsAppMessage,
} from "@/lib/server/whatsapp";

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
    expect(result.reason).toBe("missing_credentials");
    expect(result.error).toContain("not configured");
    expect(isWhatsAppConfigured()).toBe(false);
  });

  it("returns missing credentials when Twilio credentials are incomplete", async () => {
    process.env.WHATSAPP_PROVIDER = "twilio";
    process.env.WHATSAPP_ACCOUNT_SID = "AC123";
    delete process.env.WHATSAPP_AUTH_TOKEN;
    delete process.env.WHATSAPP_FROM_NUMBER;

    const result = await sendWhatsAppMessage("0501234567", "בדיקה");

    expect(result.success).toBe(false);
    expect(result.reason).toBe("missing_credentials");
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
    expect(result.reason).toBe("provider_error");
    expect(result.error).toContain("Twilio error (400)");
  });
});
