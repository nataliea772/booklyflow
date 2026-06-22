"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BookingSteps from "@/components/BookingSteps";
import BusinessBrandingHeader from "@/components/BusinessBrandingHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import ServiceSelectCards from "@/components/ServiceSelectCards";
import { useAppointments } from "@/hooks/useAppointments";
import { useBlockedTimes } from "@/hooks/useBlockedTimes";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useServices } from "@/hooks/useServices";
import {
  calculateEndTime,
  findService,
  formatTimeLabel,
  getAvailableSlots,
  isDateFullyBlocked,
  isWorkingDay,
} from "@/lib/availability";
import { formatBookingHoursHint } from "@/lib/appointment-edit";
import {
  getBookingWindowMaxDate,
  isDateWithinBookingWindow,
  resolveBookingWindowDays,
} from "@/lib/booking-window";
import { getPublicBusinessName } from "@/lib/business-config";
import { getTodayDateString } from "@/lib/dates";
import type { TimeSlot } from "@/lib/types";

export default function BookPage() {
  const router = useRouter();
  const { appointments, addAppointment, isReady: appointmentsReady } =
    useAppointments();
  const { services, isReady: servicesReady } = useServices();
  const { settings: businessSettings, isReady: settingsReady } =
    useBusinessSettings();
  const { blockedTimes, isReady: blockedTimesReady } = useBlockedTimes();

  const [serviceId, setServiceId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReady =
    servicesReady && settingsReady && appointmentsReady && blockedTimesReady;

  const today = getTodayDateString();
  const bookingWindowDays = resolveBookingWindowDays(businessSettings);
  const maxBookingDate = getBookingWindowMaxDate(today, bookingWindowDays);

  const businessName = getPublicBusinessName(businessSettings);
  const displaySettings = { ...businessSettings, businessName };
  const activeServices = services.filter((service) => service.isActive);

  const selectedService = useMemo(
    () => findService(services, serviceId),
    [serviceId, services]
  );

  const availableSlots: TimeSlot[] = useMemo(() => {
    if (!selectedService || !appointmentDate) return [];

    return getAvailableSlots({
      selectedDate: appointmentDate,
      selectedService,
      appointments,
      businessSettings,
      blockedTimes,
    });
  }, [
    selectedService,
    appointmentDate,
    appointments,
    businessSettings,
    blockedTimes,
  ]);

  const currentStep: 1 | 2 | 3 = !serviceId
    ? 1
    : !appointmentDate || !selectedStartTime
      ? 2
      : 3;

  useEffect(() => {
    setSelectedStartTime("");
  }, [serviceId, appointmentDate]);

  const isFormComplete =
    Boolean(serviceId) &&
    Boolean(appointmentDate) &&
    Boolean(selectedStartTime) &&
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0;

  const isClosedDay =
    Boolean(appointmentDate) && !isWorkingDay(appointmentDate, businessSettings);

  const isFullyBlockedDay =
    Boolean(appointmentDate) &&
    isDateFullyBlocked(appointmentDate, blockedTimes);

  const isBeyondBookingWindow =
    Boolean(appointmentDate) &&
    !isDateWithinBookingWindow(appointmentDate, today, bookingWindowDays);

  const hoursHint = formatBookingHoursHint(
    businessSettings,
    appointmentDate || undefined
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isFormComplete || !selectedService || isSubmitting) return;

    setIsSubmitting(true);

    const endTime = calculateEndTime(
      selectedStartTime,
      selectedService.durationMinutes
    );

    try {
      const created = await addAppointment({
        id: `apt-${Date.now()}`,
        serviceId: selectedService.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        appointmentDate,
        startTime: selectedStartTime,
        endTime,
        status: "pending",
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      });

      const redirectId = created?.id;
      router.push(
        redirectId
          ? `/thank-you?appointmentId=${encodeURIComponent(redirectId)}`
          : "/thank-you"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center py-20">
        <div className="loader-premium" role="status" aria-label="טוען" />
      </div>
    );
  }

  if (activeServices.length === 0) {
    return (
      <>
        <BusinessBrandingHeader settings={displaySettings} />
        <div className="page-container py-12 sm:py-16">
          <EmptyState
            icon="✨"
            title="אין שירותים זמינים להזמנה כרגע"
            description="העסק מעדכן כעת את רשימת השירותים. נשמח לראות אתכם שוב בקרוב."
            action={{ label: "חזרה לדף הראשי", href: "/" }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <BusinessBrandingHeader settings={displaySettings} />

      <div className="page-container pb-28 pt-2 sm:pb-12 sm:pt-4">
        <div className="mx-auto max-w-2xl">
          <div className="boutique-card p-5 sm:p-8">
            <div className="mb-6 border-b border-[#F9A8D4]/20 pb-6">
              <h2 className="text-xl font-extrabold text-[#581C87] sm:text-2xl">
                השלימו את ההזמנה
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                שלושה צעדים קצרים — וסיימתם.
              </p>
            </div>

            <BookingSteps currentStep={currentStep} />

            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#BE185D]">
                  1 · בחירת שירות
                </h3>
                <ServiceSelectCards
                  services={activeServices}
                  selectedId={serviceId}
                  onSelect={setServiceId}
                />
                <select
                  id="service"
                  name="service"
                  data-testid="service-select"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <option value="">בחרו שירות</option>
                  {activeServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#BE185D]">
                  2 · תאריך ושעה
                </h3>
                <input
                  type="date"
                  id="date"
                  name="date"
                  data-testid="date-input"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={today}
                  max={maxBookingDate}
                  className="input-field ltr-value"
                  disabled={!serviceId}
                />
                <p className="text-xs text-[#6B7280]">{hoursHint}</p>

                {!serviceId || !appointmentDate ? (
                  <p className="rounded-2xl border border-dashed border-[#F9A8D4]/30 px-4 py-5 text-center text-sm text-[#6B7280]">
                    בחרו שירות ותאריך כדי לראות שעות פנויות.
                  </p>
                ) : isBeyondBookingWindow ? (
                  <p
                    className="rounded-2xl border border-[#F5D0A9]/50 bg-[#FFFBF5] px-4 py-6 text-center text-sm font-medium text-[#9A3412]"
                    data-testid="booking-window-message"
                  >
                    ניתן להזמין תור עד {bookingWindowDays} ימים קדימה
                  </p>
                ) : isClosedDay ? (
                  <p className="rounded-2xl border border-[#F5D0A9]/50 bg-[#FFFBF5] px-4 py-6 text-center text-sm font-medium text-[#9A3412]">
                    העסק אינו פעיל ביום זה
                  </p>
                ) : isFullyBlockedDay ? (
                  <p className="rounded-2xl border border-[#F5D0A9]/50 bg-[#FFFBF5] px-4 py-6 text-center text-sm font-medium text-[#9A3412]">
                    התאריך שנבחר אינו זמין להזמנות
                  </p>
                ) : availableSlots.length === 0 ? (
                  <p className="rounded-2xl border border-[#E9D5FF] bg-[#FDF4FF]/50 px-4 py-6 text-center text-sm font-medium text-[#581C87]">
                    אין שעות פנויות בתאריך שנבחר
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedStartTime === slot.startTime;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          data-testid={`time-slot-${slot.startTime}`}
                          onClick={() => setSelectedStartTime(slot.startTime)}
                          className={`pill-slot ltr-value ${
                            isSelected ? "pill-slot-selected" : ""
                          }`}
                        >
                          {formatTimeLabel(slot.startTime)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#BE185D]">
                  3 · פרטי לקוח
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-[#1F2937]"
                    >
                      שם מלא
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      data-testid="customer-name-input"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="ישראל ישראלי"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-[#1F2937]"
                    >
                      מספר טלפון
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      data-testid="phone-input"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="050-123-4567"
                      className="input-field ltr-value"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-semibold text-[#1F2937]"
                  >
                    הערות{" "}
                    <span className="font-normal text-[#6B7280]">(אופציונלי)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    data-testid="notes-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="בקשות מיוחדות..."
                    className="input-field resize-none"
                  />
                </div>
              </section>

              <div className="sticky bottom-0 -mx-6 border-t bg-[#FFFDF8]/95 px-6 py-4 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-4" style={{ borderColor: "rgba(124, 58, 237, 0.1)" }}>
                <Button
                  type="submit"
                  size="xl"
                  className="w-full"
                  disabled={!isFormComplete || isSubmitting}
                  data-testid="submit-booking-button"
                >
                  שליחת בקשת תור
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
