"use client";

import { useMemo, useState } from "react";
import AdminNav from "@/components/AdminNav";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { PageLoadingState } from "@/components/LoadingSkeleton";
import { useAppointments } from "@/hooks/useAppointments";
import { useReviews } from "@/hooks/useReviews";
import { useServices } from "@/hooks/useServices";
import { getServiceName } from "@/lib/availability";
import { formatStarRating } from "@/lib/reviews-display";
import { formatShortDate } from "@/lib/i18n";

const SAVE_ERROR = "לא הצלחנו לעדכן את הביקורת. נסי שוב.";
const DELETE_CONFIRM = "האם למחוק את הביקורת? פעולה זו לא ניתנת לשחזור.";

export default function ReviewsPage() {
  const { reviews, isReady, usesDatabase, updateReviewVisibility, removeReview } =
    useReviews();
  const { appointments } = useAppointments();
  const { services } = useServices();
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reviews]
  );

  const visibleCount = reviews.filter((review) => review.isVisible).length;

  async function handleToggleVisible(reviewId: string, isVisible: boolean) {
    setActionError(null);
    setTogglingId(reviewId);
    const updated = await updateReviewVisibility(reviewId, !isVisible);
    setTogglingId(null);

    if (!updated) {
      setActionError(SAVE_ERROR);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!window.confirm(DELETE_CONFIRM)) {
      return;
    }

    setActionError(null);
    setDeletingId(reviewId);
    const deleted = await removeReview(reviewId);
    setDeletingId(null);

    if (!deleted) {
      setActionError(SAVE_ERROR);
    }
  }

  if (!isReady) {
    return (
      <>
        <div className="page-container pt-4 sm:pt-6">
          <AdminNav />
        </div>
        <PageLoadingState label="טוען ביקורות…" />
      </>
    );
  }

  if (!usesDatabase) {
    return (
      <>
        <div className="page-container pt-4 sm:pt-6">
          <AdminNav />
        </div>
        <div className="page-container pb-12 sm:pb-16">
          <EmptyState
            icon="⭐"
            title="ביקורות זמינות עם Supabase"
            description="חברו את הפרויקט ל-Supabase כדי לנהל ביקורות לקוחות."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-container pt-4 sm:pt-6">
        <AdminNav />
      </div>

      <div className="page-container pb-12 sm:pb-16">
        {reviews.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            <Badge variant="neutral">{reviews.length} סה״כ</Badge>
            <Badge variant="primary">{visibleCount} מוצגות ללקוחות</Badge>
          </div>
        )}

        <Card glass accent="primary" padding="lg">
          <CardHeader
            title="כל הביקורות"
            description="ביקורות שהתקבלו מלקוחות דרך קישור לאחר תור שהושלם."
          />

          {actionError && (
            <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {actionError}
            </p>
          )}

          {sortedReviews.length === 0 ? (
            <EmptyState
              icon="⭐"
              title="אין ביקורות עדיין"
              description="ביקורות יופיעו לאחר שלקוחות ישאירו דירוג."
            />
          ) : (
            <div className="space-y-4">
              {sortedReviews.map((review) => {
                const relatedAppointment = review.appointmentId
                  ? appointments.find(
                      (appointment) => appointment.id === review.appointmentId
                    )
                  : undefined;

                return (
                  <div
                    key={review.id}
                    className="list-card"
                    data-testid={`admin-review-row-${review.id}`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-bold text-[#111827]">
                            {review.customerName}
                          </p>
                          {!review.isVisible && (
                            <Badge variant="neutral">מוסתר</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-charcoal">
                          {formatStarRating(review.rating)}
                        </p>
                        {review.comment && (
                          <p className="mt-2 text-sm leading-relaxed text-muted">
                            {review.comment}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-muted">
                          {formatShortDate(review.createdAt.slice(0, 10))}
                        </p>
                        {relatedAppointment && (
                          <p className="mt-2 text-sm text-[#111827]">
                            תור:{" "}
                            {getServiceName(services, relatedAppointment.serviceId)}{" "}
                            ·{" "}
                            {formatShortDate(relatedAppointment.appointmentDate)}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={togglingId === review.id}
                          onClick={() =>
                            handleToggleVisible(review.id, review.isVisible)
                          }
                          data-testid={`toggle-review-visible-${review.id}`}
                        >
                          {togglingId === review.id
                            ? "מעדכן…"
                            : review.isVisible
                              ? "הסתרה"
                              : "הצגה"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={deletingId === review.id}
                          onClick={() => handleDelete(review.id)}
                          data-testid={`delete-review-${review.id}`}
                        >
                          {deletingId === review.id ? "מוחק…" : "מחיקה"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
