export const REVIEW_RATING_REQUIRED_MESSAGE = "נא לבחור דירוג";

export function isReviewRatingSelected(rating: number | null | undefined): boolean {
  return typeof rating === "number" && rating >= 1 && rating <= 5;
}

export function validateReviewRating(
  rating: number | null | undefined
): string | null {
  if (!isReviewRatingSelected(rating)) {
    return REVIEW_RATING_REQUIRED_MESSAGE;
  }

  return null;
}
