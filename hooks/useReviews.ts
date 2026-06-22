"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { CustomerReview } from "@/lib/types";

export function useReviews() {
  const usesDatabase = isSupabaseConfigured();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refreshReviews = useCallback(async () => {
    if (!usesDatabase) {
      setReviews([]);
      return;
    }

    const { getAllReviews } = await import("@/lib/supabase/reviews");
    setReviews(await getAllReviews());
  }, [usesDatabase]);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        if (!usesDatabase) {
          if (!cancelled) {
            setReviews([]);
            setIsReady(true);
          }
          return;
        }

        const { getAllReviews } = await import("@/lib/supabase/reviews");
        const remoteReviews = await getAllReviews();
        if (!cancelled) {
          setReviews(remoteReviews);
          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to load reviews:", error);
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
  }, [usesDatabase]);

  const updateReviewVisibility = useCallback(
    async (reviewId: string, isVisible: boolean) => {
      if (!usesDatabase) {
        return null;
      }

      const { updateReviewVisibility: updateRemoteVisibility } = await import(
        "@/lib/supabase/reviews"
      );
      const updated = await updateRemoteVisibility(reviewId, isVisible);
      if (updated) {
        setReviews((current) =>
          current.map((review) => (review.id === reviewId ? updated : review))
        );
      } else {
        await refreshReviews();
      }
      return updated;
    },
    [usesDatabase, refreshReviews]
  );

  const removeReview = useCallback(
    async (reviewId: string) => {
      if (!usesDatabase) {
        return false;
      }

      const { deleteReview } = await import("@/lib/supabase/reviews");
      const deleted = await deleteReview(reviewId);
      if (deleted) {
        setReviews((current) =>
          current.filter((review) => review.id !== reviewId)
        );
      } else {
        await refreshReviews();
      }
      return deleted;
    },
    [usesDatabase, refreshReviews]
  );

  return {
    reviews,
    isReady,
    usesDatabase,
    updateReviewVisibility,
    removeReview,
    refreshReviews,
  };
}
