"use client";

import { useEffect, useState } from "react";
import {
  formatStarRating,
  pickPublicReviews,
} from "@/lib/reviews-display";
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

  if (!isReady || reviews.length === 0) {
    return null;
  }

  return (
    <section
      className="page-container py-8 sm:py-10"
      data-testid="customer-reviews-section"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#BE185D]">
            חוויות לקוחות
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#581C87] sm:text-3xl">
            לקוחות מספרות
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="boutique-card p-5 text-right"
              data-testid={`customer-review-${review.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-[#111827]">{review.customerName}</p>
                <span
                  className="shrink-0 text-sm tracking-tight text-[#BE185D]"
                  aria-label={`דירוג ${review.rating} מתוך 5`}
                >
                  {formatStarRating(review.rating)}
                </span>
              </div>
              {review.comment && (
                <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
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
