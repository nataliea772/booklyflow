"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatStarRating,
  pickPublicReviews,
} from "@/lib/reviews-display";
import {
  calculateAverageRating,
  formatAverageRatingLabel,
} from "@/lib/review-stats";
import { getVisibleReviews } from "@/lib/supabase/reviews";
import type { CustomerReview } from "@/lib/types";

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        const visibleReviews = await getVisibleReviews();
        if (!cancelled) {
          setReviews(pickPublicReviews(visibleReviews));
          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to load customer reviews:", error);
        if (!cancelled) {
          setReviews([]);
          setIsReady(true);
        }
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  const averageRating = useMemo(
    () => calculateAverageRating(reviews),
    [reviews]
  );

  const averageLabel = useMemo(
    () => formatAverageRatingLabel(averageRating),
    [averageRating]
  );

  if (!isReady || reviews.length === 0) {
    return null;
  }

  return (
    <section
      className="page-container py-8 sm:py-10"
      data-testid="customer-reviews-section"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 content-panel px-6 py-5 text-center">
          <p className="section-eyebrow">חוויות לקוחות</p>
          <div className="boutique-dot-divider" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h2 className="mt-3 text-2xl font-extrabold text-charcoal sm:text-3xl">
            ביקורות לקוחות
          </h2>
          {averageLabel && averageRating !== null && (
            <div
              className="mt-4 flex flex-col items-center gap-1"
              data-testid="customer-reviews-average"
            >
              <p className="text-sm font-semibold text-charcoal">{averageLabel}</p>
              <span
                className="text-base tracking-tight text-charcoal"
                aria-hidden="true"
              >
                {formatStarRating(Math.round(averageRating))}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="review-card-luxury text-right"
              data-testid={`customer-review-${review.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-charcoal">{review.customerName}</p>
                <span
                  className="shrink-0 text-sm tracking-tight text-charcoal"
                  aria-label={`דירוג ${review.rating} מתוך 5`}
                >
                  {formatStarRating(review.rating)}
                </span>
              </div>
              {review.comment && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {review.comment}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
