import { describe, expect, it } from "vitest";
import {
  buildManualWhatsAppLink,
  normalizeWhatsAppPhoneForWaMe,
} from "@/lib/whatsapp-manual-links";

describe("normalizeWhatsAppPhoneForWaMe", () => {
  it("converts Israeli local numbers to 972 format", () => {
    expect(normalizeWhatsAppPhoneForWaMe("050-123-4567")).toBe("972501234567");
  });

  it("keeps numbers that already include country code", () => {
    expect(normalizeWhatsAppPhoneForWaMe("+972501234567")).toBe("972501234567");
    expect(normalizeWhatsAppPhoneForWaMe("972501234567")).toBe("972501234567");
  });

  it("strips spaces, hyphens, and parentheses", () => {
    expect(normalizeWhatsAppPhoneForWaMe("(050) 123-4567")).toBe("972501234567");
  });
});

describe("buildManualWhatsAppLink", () => {
  it("builds a wa.me link with encoded Hebrew message", () => {
    const link = buildManualWhatsAppLink(
      "0501234567",
      "התור שלך אושר"
    );

    expect(link).toContain("https://wa.me/972501234567");
    expect(link).toContain("text=");
    expect(decodeURIComponent(link.split("text=")[1] ?? "")).toBe(
      "התור שלך אושר"
    );
  });
});
