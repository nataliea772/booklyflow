"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Button from "@/components/Button";
import { PageLoadingState } from "@/components/LoadingSkeleton";
import { validateReviewRating } from "@/lib/review-validation";
import { formatStarRating } from "@/lib/reviews-display";
import { getPublicAppointmentById } from "@/lib/supabase/appointments";
import { getReviewByAppointmentId } from "@/lib/supabase/reviews";
import type { Appointment } from "@/lib/types";

type ReviewPageState =
  | "loading"
  | "not_found"
  | "not_completed"
  | "already_reviewed"
  | "form"
  | "thank_you";

export default function CustomerReviewPage() {
  const params = useParams<{ appointmentId: string }>();
  const appointmentId = params.appointmentId?.trim() ?? "";

  const [pageState, setPageState] = useState<ReviewPageState>("loading");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReviewContext() {
      if (!appointmentId) {
        if (!cancelled) {
          setPageState("not_found");
        }
        return;
      }

      try {
        const [loadedAppointment, existingReview] = await Promise.all([
          getPublicAppointmentById(appointmentId),
          getReviewByAppointmentId(appointmentId),
        ]);

        if (cancelled) {
          return;
        }

        if (!loadedAppointment) {
          setPageState("not_found");
          return;
        }

        setAppointment(loadedAppointment);
        setCustomerName(loadedAppointment.customerName);

        if (existingReview) {
          setPageState("already_reviewed");
          return;
        }

        if (loadedAppointment.status !== "completed") {
          setPageState("not_completed");
          return;
        }

        setPageState("form");
      } catch (error) {
        console.error("Failed to load review page:", error);
        if (!cancelled) {
          setPageState("not_found");
        }
      }
    }

    loadReviewContext();

    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  const ratingPreview = useMemo(
    () => (rating ? formatStarRating(rating) : "☆☆☆☆☆"),
    [rating]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!appointmentId || pageState !== "form") {
      return;
    }

    const validationError = validateReviewRating(rating);
    if (validationError) {
      setRatingError(validationError);
      return;
    }

    setSubmitError(null);
    setRatingError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          customerName: customerName.trim(),
          rating,
          comment: comment.trim() || null,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        if (payload.error === "review_already_exists") {
          setPageState("already_reviewed");
          return;
        }

        setSubmitError("לא הצלחנו לשלוח את הביקורת. נסו שוב.");
        return;
      }

      setPageState("thank_you");
    } catch {
      setSubmitError("לא הצלחנו לשלוח את הביקורת. נסו שוב.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (pageState === "loading") {
    return <PageLoadingState label="טוען ביקורת…" />;
  }

  return (
    <div className="page-container py-10 sm:py-16">
      <div className="mx-auto max-w-lg">
        <div className="boutique-hero-card p-8 text-center sm:p-10">
          {pageState === "not_found" && (
            <>
              <h1
                className="text-2xl font-extrabold text-charcoal"
                data-testid="review-error-message"
              >
                לא מצאנו את התור
              </h1>
              <p className="mt-3 text-sm text-muted">
                ייתכן שהקישור אינו תקין או שהתור הוסר מהמערכת.
              </p>
            </>
          )}

          {pageState === "not_completed" && (
            <>
              <h1
                className="text-2xl font-extrabold text-charcoal"
                data-testid="review-error-message"
              >
                ניתן להשאיר ביקורת לאחר השלמת התור
              </h1>
              <p className="mt-3 text-sm text-muted">
                {appointment?.customerName
                  ? `שלום ${appointment.customerName},`
                  : null}{" "}
                נשמח לקבל ממך ביקורת לאחר שהתור יסומן כהושלם.
              </p>
            </>
          )}

          {pageState === "already_reviewed" && (
            <>
              <span
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50 text-3xl ring-2 ring-black/10"
                aria-hidden="true"
              >
                ✓
              </span>
              <h1
                className="mt-6 text-2xl font-extrabold text-charcoal"
                data-testid="review-error-message"
              >
                כבר התקבלה ביקורת עבור התור הזה
              </h1>
              <p className="mt-3 text-sm text-muted">
                תודה! הביקורת שלך כבר נקלטה במערכת.
              </p>
            </>
          )}

          {pageState === "thank_you" && (
            <>
              <span
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50 text-3xl ring-2 ring-black/10"
                aria-hidden="true"
              >
                ✨
              </span>
              <h1
                className="mt-6 text-2xl font-extrabold text-charcoal"
                data-testid="review-success-message"
              >
                תודה על הביקורת שלך
              </h1>
              <p className="mt-3 text-sm text-muted">
                נשמח לראות אותך שוב
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button href="/book" size="lg" data-testid="review-book-again-button">
                  הזמנת תור נוסף
                </Button>
                <Button href="/" variant="outline" size="lg">
                  חזרה לדף הבית
                </Button>
              </div>
            </>
          )}

          {pageState === "form" && (
            <>
              <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
                איך הייתה החוויה שלך?
              </h1>
              <p className="mt-3 text-sm text-muted">
                נשמח לשמוע על הביקורת שלך לאחר התור.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5 text-right"
                data-testid="customer-review-form"
              >
                <div>
                  <label
                    htmlFor="reviewCustomerName"
                    className="mb-2 block text-sm font-bold text-[#111827]"
                  >
                    שם
                  </label>
                  <input
                    id="reviewCustomerName"
                    type="text"
                    required
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className="input-field"
                    data-testid="review-customer-name-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reviewRating"
                    className="mb-2 block text-sm font-bold text-charcoal"
                  >
                    דירוג
                  </label>
                  <select
                    id="reviewRating"
                    value={rating ?? ""}
                    onChange={(event) => {
                      const nextValue = event.target.value
                        ? Number(event.target.value)
                        : null;
                      setRating(nextValue);
                      setRatingError(null);
                    }}
                    className="input-field"
                    data-testid="review-rating-select"
                  >
                    <option value="">בחרי דירוג</option>
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} — {formatStarRating(value)}
                      </option>
                    ))}
                  </select>
                  {ratingError && (
                    <p
                      className="mt-2 text-sm font-medium text-red-700"
                      data-testid="review-rating-error"
                    >
                      {ratingError}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-charcoal">{ratingPreview}</p>
                </div>

                <div>
                  <label
                    htmlFor="reviewComment"
                    className="mb-2 block text-sm font-bold text-[#111827]"
                  >
                    תגובה{" "}
                    <span className="font-normal text-muted">(אופציונלי)</span>
                  </label>
                  <textarea
                    id="reviewComment"
                    rows={4}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    className="input-field resize-none"
                    data-testid="review-comment-input"
                  />
                </div>

                {submitError && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {submitError}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="review-submit-button"
                >
                  {isSubmitting ? "שולח…" : "שליחת ביקורת"}
                </Button>
              </form>
            </>
          )}

          {(pageState === "not_found" ||
            pageState === "not_completed" ||
            pageState === "already_reviewed") && (
            <div className="mt-8">
              <Button href="/" variant="outline" size="lg">
                חזרה לדף הבית
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
