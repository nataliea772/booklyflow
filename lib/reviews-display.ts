import type { CustomerReview } from "@/lib/types";

export const PUBLIC_REVIEWS_LIMIT = 6;

export function formatStarRating(rating: number): string {
  const safeRating = Math.min(5, Math.max(1, Math.round(rating)));
  return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
}

export function sortReviewsNewestFirst(
  reviews: CustomerReview[]
): CustomerReview[] {
  return [...reviews].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function pickPublicReviews(
  reviews: CustomerReview[],
  limit = PUBLIC_REVIEWS_LIMIT
): CustomerReview[] {
  return sortReviewsNewestFirst(
    reviews.filter((review) => review.isVisible)
  ).slice(0, limit);
}

export function hasVisibleReviews(reviews: CustomerReview[]): boolean {
  return reviews.some((review) => review.isVisible);
}
