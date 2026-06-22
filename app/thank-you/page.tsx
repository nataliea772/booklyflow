"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { useAppointments } from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import { formatTimeLabel, getServiceName } from "@/lib/availability";
import { formatDisplayDate } from "@/lib/i18n";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId")?.trim() ?? "";
  const { appointments, isReady: appointmentsReady } = useAppointments();
  const { services, isReady: servicesReady } = useServices();

  const isReady = appointmentsReady && servicesReady;

  const appointment = useMemo(
    () =>
      appointmentId
        ? appointments.find((item) => item.id === appointmentId)
        : undefined,
    [appointmentId, appointments]
  );

  const serviceName = appointment
    ? getServiceName(services, appointment.serviceId)
    : null;

  if (!isReady) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center py-20">
        <div className="loader-premium" role="status" aria-label="טוען" />
      </div>
    );
  }

  const showSummary = Boolean(appointment && serviceName);

  return (
    <div className="page-container py-10 sm:py-16">
      <div className="mx-auto max-w-lg">
        <div className="boutique-card p-8 text-center sm:p-10">
          <span
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-bl from-[#fff1f7] to-[#fce7f3] text-4xl ring-2 ring-[#f9a8d4]/35"
            role="img"
            aria-hidden="true"
          >
            💫
          </span>
          <h1
            className="mt-6 text-2xl font-extrabold text-charcoal sm:text-3xl"
            data-testid="booking-success-message"
          >
            תודה, הבקשה לתור התקבלה
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            נעדכן אותך לאחר אישור התור
          </p>

          {showSummary && appointment && (
            <div className="mt-8 rounded-2xl border border-[#f9a8d4]/30 bg-[#fff1f7]/70 p-6 text-right">
              <p className="section-eyebrow">
                סיכום התור
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">שירות</dt>
                  <dd className="font-semibold text-charcoal">{serviceName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">תאריך</dt>
                  <dd className="font-semibold text-charcoal">
                    {formatDisplayDate(appointment.appointmentDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">שעה</dt>
                  <dd className="font-semibold text-charcoal ltr-value">
                    {formatTimeLabel(appointment.startTime)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">שם</dt>
                  <dd className="font-semibold text-charcoal">
                    {appointment.customerName}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button href="/" variant="outline" size="lg">
              חזרה לדף הבית
            </Button>
            <Button href="/book" size="lg" data-testid="book-another-button">
              הזמנת תור נוסף
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container flex min-h-[50vh] items-center justify-center py-20">
          <div className="loader-premium" role="status" aria-label="טוען" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
