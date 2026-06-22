import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildReviewLink, getSiteUrl } from "@/lib/review-links";

describe("getSiteUrl", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }
  });

  it("uses NEXT_PUBLIC_SITE_URL when configured", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://booklyflow.example/";

    expect(getSiteUrl()).toBe("https://booklyflow.example");
  });

  it("falls back to provided origin on the client", () => {
    expect(getSiteUrl("https://client.example")).toBe("https://client.example");
  });

  it("defaults to localhost when no site URL is configured", () => {
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});

describe("buildReviewLink", () => {
  it("builds a review URL for an appointment id", () => {
    expect(
      buildReviewLink("abc-123", "https://booklyflow.example")
    ).toBe("https://booklyflow.example/review/abc-123");
  });

  it("encodes appointment ids safely", () => {
    expect(
      buildReviewLink("id/with space", "https://booklyflow.example")
    ).toBe("https://booklyflow.example/review/id%2Fwith%20space");
  });
});
