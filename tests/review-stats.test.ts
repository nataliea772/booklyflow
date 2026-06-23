import { describe, expect, it } from "vitest";
import {
  calculateAverageRating,
  formatAverageRating,
  formatAverageRatingLabel,
} from "@/lib/review-stats";
import type { CustomerReview } from "@/lib/types";

function createReview(
  overrides: Partial<CustomerReview> = {}
): CustomerReview {
  return {
    id: "review-1",
    customerName: "Test Customer",
    rating: 5,
    isVisible: true,
    createdAt: "2026-06-22T10:00:00.000Z",
    ...overrides,
  };
}

describe("calculateAverageRating", () => {
  it("returns null when there are no reviews", () => {
    expect(calculateAverageRating([])).toBeNull();
  });

  it("rounds to one decimal", () => {
    const reviews = [
      createReview({ id: "1", rating: 5 }),
      createReview({ id: "2", rating: 4 }),
      createReview({ id: "3", rating: 5 }),
    ];

    expect(calculateAverageRating(reviews)).toBe(4.7);
  });

  it("returns 5.0 for uniform ratings", () => {
    expect(
      calculateAverageRating([
        createReview({ id: "1", rating: 5 }),
        createReview({ id: "2", rating: 5 }),
      ])
    ).toBe(5);
  });

  it("can include only visible reviews", () => {
    const reviews = [
      createReview({ id: "1", rating: 5 }),
      createReview({ id: "2", rating: 1, isVisible: false }),
    ];

    expect(calculateAverageRating(reviews, { visibleOnly: true })).toBe(5);
    expect(calculateAverageRating(reviews, { visibleOnly: false })).toBe(3);
  });
});

describe("formatAverageRating", () => {
  it("formats with one decimal and Hebrew suffix", () => {
    expect(formatAverageRating(4.7)).toBe("4.7 מתוך 5");
    expect(formatAverageRating(5)).toBe("5.0 מתוך 5");
  });

  it("returns null for missing values", () => {
    expect(formatAverageRating(null)).toBeNull();
  });
});

describe("formatAverageRatingLabel", () => {
  it("builds a prefixed label", () => {
    expect(formatAverageRatingLabel(4.8)).toBe("דירוג ממוצע: 4.8 מתוך 5");
  });
});
