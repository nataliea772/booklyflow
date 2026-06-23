import type { CustomerReview } from "@/lib/types";

export type AverageRatingOptions = {
  /** When true, only reviews with `isVisible` are included. Default false. */
  visibleOnly?: boolean;
};

/** Returns average rating rounded to one decimal, or null when no eligible reviews. */
export function calculateAverageRating(
  reviews: CustomerReview[],
  options: AverageRatingOptions = {}
): number | null {
  const visibleOnly = options.visibleOnly ?? false;
  const eligible = visibleOnly
    ? reviews.filter((review) => review.isVisible)
    : reviews;

  if (eligible.length === 0) {
    return null;
  }

  const total = eligible.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / eligible.length) * 10) / 10;
}

/** Formats a rating as Hebrew text, e.g. "4.7 מתוך 5". */
export function formatAverageRating(value: number | null): string | null {
  if (value === null) {
    return null;
  }

  return `${value.toFixed(1)} מתוך 5`;
}

/** Combined helper for display labels like "דירוג ממוצע: 4.7 מתוך 5". */
export function formatAverageRatingLabel(
  value: number | null,
  prefix = "דירוג ממוצע"
): string | null {
  const formatted = formatAverageRating(value);
  if (!formatted) {
    return null;
  }

  return `${prefix}: ${formatted}`;
}
