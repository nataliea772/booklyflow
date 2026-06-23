import { describe, expect, it } from "vitest";
import {
  REVIEW_RATING_REQUIRED_MESSAGE,
  isReviewRatingSelected,
  validateReviewRating,
} from "@/lib/review-validation";

describe("validateReviewRating", () => {
  it("requires a rating between 1 and 5", () => {
    expect(validateReviewRating(null)).toBe(REVIEW_RATING_REQUIRED_MESSAGE);
    expect(validateReviewRating(undefined)).toBe(REVIEW_RATING_REQUIRED_MESSAGE);
    expect(validateReviewRating(0)).toBe(REVIEW_RATING_REQUIRED_MESSAGE);
  });

  it("accepts valid ratings", () => {
    expect(validateReviewRating(4)).toBeNull();
    expect(isReviewRatingSelected(5)).toBe(true);
  });
});
