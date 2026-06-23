import { describe, expect, it } from "vitest";
import {
  normalizeSocialUrl,
  validateSocialUrl,
} from "@/lib/social-links";

describe("normalizeSocialUrl", () => {
  it("adds https to instagram.com paths", () => {
    expect(normalizeSocialUrl("instagram.com/booklyflow", "instagram")).toBe(
      "https://instagram.com/booklyflow"
    );
  });

  it("adds https to facebook.com paths", () => {
    expect(normalizeSocialUrl("facebook.com/booklyflow", "facebook")).toBe(
      "https://facebook.com/booklyflow"
    );
  });

  it("keeps valid https urls", () => {
    expect(
      normalizeSocialUrl("https://www.instagram.com/booklyflow/", "instagram")
    ).toBe("https://www.instagram.com/booklyflow/");
  });

  it("returns null for invalid hosts", () => {
    expect(normalizeSocialUrl("https://example.com/page", "facebook")).toBeNull();
  });
});

describe("validateSocialUrl", () => {
  it("returns null for empty values", () => {
    expect(validateSocialUrl("", "instagram")).toBeNull();
  });

  it("returns Hebrew error for invalid instagram url", () => {
    expect(
      validateSocialUrl("https://example.com/page", "instagram")
    ).toContain("Instagram");
  });
});
