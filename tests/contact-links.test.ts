import { describe, expect, it } from "vitest";
import {
  buildNavigationLink,
  buildPublicContactActions,
  buildTelLink,
  buildWhatsAppLink,
  hasPublicContactActions,
  normalizeWhatsAppPhone,
  resolveWhatsAppPhone,
} from "@/lib/contact-links";

describe("normalizeWhatsAppPhone", () => {
  it("converts Israeli local numbers to 972 format without plus", () => {
    expect(normalizeWhatsAppPhone("050-123-4567")).toBe("972501234567");
  });

  it("keeps numbers that already include country code", () => {
    expect(normalizeWhatsAppPhone("+972501234567")).toBe("972501234567");
    expect(normalizeWhatsAppPhone("972501234567")).toBe("972501234567");
  });
});

describe("contact link builders", () => {
  it("builds a tel link from a phone number", () => {
    expect(buildTelLink("050-123-4567")).toBe("tel:0501234567");
  });

  it("builds a wa.me link with Hebrew greeting text", () => {
    const link = buildWhatsAppLink("050-1234567");
    expect(link).toContain("https://wa.me/972501234567");
    expect(link).toContain("text=");
    expect(decodeURIComponent(link.split("text=")[1] ?? "")).toContain("שלום");
  });

  it("prefers waze url over location url", () => {
    expect(
      buildNavigationLink({
        wazeUrl: "https://waze.com/ul/abc",
        locationUrl: "https://maps.google.com/?q=test",
      })
    ).toBe("https://waze.com/ul/abc");
  });

  it("falls back to location url when waze is missing", () => {
    expect(
      buildNavigationLink({
        locationUrl: "https://maps.google.com/?q=test",
      })
    ).toBe("https://maps.google.com/?q=test");
  });
});

describe("buildPublicContactActions", () => {
  it("returns no actions when contact fields are missing", () => {
    expect(buildPublicContactActions({})).toEqual([]);
    expect(hasPublicContactActions({})).toBe(false);
  });

  it("builds phone, navigation, and whatsapp actions when configured", () => {
    const actions = buildPublicContactActions({
      phone: "050-123-4567",
      whatsappPhone: "050-987-6543",
      wazeUrl: "https://waze.com/ul/abc",
    });

    expect(actions.map((action) => action.id)).toEqual([
      "whatsapp",
      "navigation",
      "phone",
    ]);
    expect(actions[0]?.ariaLabel).toBe("שליחת הודעת WhatsApp");
    expect(actions[0]?.href).toContain("972509876543");
    expect(actions[1]?.external).toBe(true);
    expect(actions[1]?.ariaLabel).toBe("ניווט ב-Waze");
    expect(actions[2]?.href).toBe("tel:0501234567");
    expect(actions[2]?.ariaLabel).toBe("התקשרות לעסק");
  });

  it("uses phone as whatsapp fallback", () => {
    expect(resolveWhatsAppPhone({ phone: "050-123-4567" })).toBe(
      "050-123-4567"
    );
  });
});
