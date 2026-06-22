import { describe, expect, it } from "vitest";
import {
  formatStarRating,
  hasVisibleReviews,
  pickPublicReviews,
} from "@/lib/reviews-display";
import type { CustomerReview } from "@/lib/types";

function createReview(
  overrides: Partial<CustomerReview> = {}
): CustomerReview {
  return {
    id: "review-1",
    customerName: "Test Customer",
    rating: 5,
    comment: "Great service",
    isVisible: true,
    createdAt: "2026-06-22T10:00:00.000Z",
    ...overrides,
  };
}

describe("formatStarRating", () => {
  it("renders filled and empty stars for a rating", () => {
    expect(formatStarRating(4)).toBe("★★★★☆");
  });
});

describe("pickPublicReviews", () => {
  it("returns only visible reviews sorted newest first with limit", () => {
    const reviews = [
      createReview({ id: "1", createdAt: "2026-06-20T10:00:00.000Z" }),
      createReview({
        id: "2",
        isVisible: false,
        createdAt: "2026-06-23T10:00:00.000Z",
      }),
      createReview({ id: "3", createdAt: "2026-06-22T10:00:00.000Z" }),
    ];

    expect(pickPublicReviews(reviews, 2).map((review) => review.id)).toEqual([
      "3",
      "1",
    ]);
  });

  it("detects when there are no visible reviews", () => {
    expect(
      hasVisibleReviews([
        createReview({ isVisible: false }),
        createReview({ id: "2", isVisible: false }),
      ])
    ).toBe(false);
  });
});
