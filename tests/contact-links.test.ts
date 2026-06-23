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

  it("builds phone, navigation, whatsapp, and social actions when configured", () => {
    const actions = buildPublicContactActions({
      phone: "050-123-4567",
      whatsappPhone: "050-987-6543",
      wazeUrl: "https://waze.com/ul/abc",
      instagramUrl: "https://instagram.com/booklyflow",
      facebookUrl: "https://facebook.com/booklyflow",
    });

    expect(actions.map((action) => action.id)).toEqual([
      "whatsapp",
      "instagram",
      "facebook",
      "navigation",
      "phone",
    ]);
    expect(actions[0]?.ariaLabel).toBe("שליחת הודעת WhatsApp");
    expect(actions[1]?.ariaLabel).toBe("פתיחת Instagram");
    expect(actions[2]?.ariaLabel).toBe("פתיחת Facebook");
    expect(actions[3]?.external).toBe(true);
    expect(actions[4]?.href).toBe("tel:0501234567");
  });

  it("omits social icons when links are not configured", () => {
    const actions = buildPublicContactActions({
      wazeUrl: "https://waze.com/ul/abc",
    });

    expect(actions.map((action) => action.id)).toEqual(["navigation"]);
  });

  it("uses phone as whatsapp fallback", () => {
    expect(resolveWhatsAppPhone({ phone: "050-123-4567" })).toBe(
      "050-123-4567"
    );
  });
});
