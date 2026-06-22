"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import BookingSteps from "@/components/BookingSteps";
import BusinessBrandingHeader from "@/components/BusinessBrandingHeader";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import ServiceSelectCards from "@/components/ServiceSelectCards";
import { useAppointments } from "@/hooks/useAppointments";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useServices } from "@/hooks/useServices";
import {
  calculateEndTime,
  findService,
  formatTimeLabel,
  getAvailableSlots,
  isWorkingDay,
} from "@/lib/availability";
import { getPublicBusinessName } from "@/lib/business-config";
import { formatDisplayDate } from "@/lib/i18n";
import type { TimeSlot } from "@/lib/types";

type BookedAppointment = {
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
};

export default function BookPage() {
  const { appointments, addAppointment, isReady: appointmentsReady } =
    useAppointments();
  const { services, isReady: servicesReady } = useServices();
  const { settings: businessSettings, isReady: settingsReady } =
    useBusinessSettings();

  const [serviceId, setServiceId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bookedAppointment, setBookedAppointment] =
    useState<BookedAppointment | null>(null);

  const isReady = servicesReady && settingsReady && appointmentsReady;

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
    });
  }, [selectedService, appointmentDate, appointments, businessSettings]);

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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isFormComplete || !selectedService) return;

    const endTime = calculateEndTime(
      selectedStartTime,
      selectedService.durationMinutes
    );

    addAppointment({
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

    setBookedAppointment({
      serviceName: selectedService.name,
      appointmentDate,
      startTime: selectedStartTime,
      endTime,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      notes: notes.trim() || undefined,
    });
  }

  function resetBooking() {
    setBookedAppointment(null);
    setServiceId("");
    setAppointmentDate("");
    setSelectedStartTime("");
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
  }

  if (!isReady) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center py-20">
        <div className="loader-premium" role="status" aria-label="טוען" />
      </div>
    );
  }

  if (bookedAppointment) {
    return (
      <div className="page-container py-20 sm:py-28">
        <div className="mx-auto max-w-lg">
          <div className="surface-premium p-8 text-center sm:p-10">
            <span
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-bl from-emerald-50 to-emerald-100 text-4xl ring-1 ring-emerald-200/60"
              role="img"
              aria-hidden="true"
            >
              ✅
            </span>
            <h1
              className="mt-8 text-3xl font-bold text-[#111827]"
              data-testid="booking-success-message"
            >
              בקשת ההזמנה התקבלה!
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              תודה, {bookedAppointment.customerName}. בקשת התור שלך ב-
              {businessName} נשלחה בהצלחה.
            </p>

            <div className="mt-8 rounded-2xl border border-primary/10 bg-primary-soft/40 p-6 text-right">
              <p className="text-sm font-semibold text-muted">פרטי התור</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">שירות</dt>
                  <dd className="font-semibold text-[#111827]">
                    {bookedAppointment.serviceName}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">תאריך</dt>
                  <dd className="font-semibold text-[#111827]">
                    {formatDisplayDate(bookedAppointment.appointmentDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">שעה</dt>
                  <dd className="font-semibold text-[#111827] ltr-value">
                    {formatTimeLabel(bookedAppointment.startTime)} –{" "}
                    {formatTimeLabel(bookedAppointment.endTime)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">טלפון</dt>
                  <dd className="font-semibold text-[#111827] ltr-value">
                    {bookedAppointment.customerPhone}
                  </dd>
                </div>
                {bookedAppointment.notes && (
                  <div>
                    <dt className="text-muted">הערות</dt>
                    <dd className="mt-1 font-medium text-[#111827]">
                      {bookedAppointment.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button href="/" variant="outline" size="lg">
                חזרה לדף הבית
              </Button>
              <Button
                onClick={resetBooking}
                size="lg"
                data-testid="book-another-button"
              >
                הזמנת תור נוסף
              </Button>
            </div>
          </div>
        </div>
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
            title="אין שירותים זמינים כרגע"
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

      <div className="page-container py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="surface-premium hero-glow-ring relative overflow-hidden p-8 sm:p-10">
            <CardHeader
              title="פרטי ההזמנה"
              description="מלאו את הפרטים בשלושה צעדים קצרים."
            />
            <BookingSteps currentStep={currentStep} />

            <form onSubmit={handleSubmit} className="space-y-10">
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-[#111827]">
                  1. בחירת שירות
                </h2>
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
                <h2 className="text-lg font-bold text-[#111827]">
                  2. בחירת תאריך ושעה
                </h2>
                <input
                  type="date"
                  id="date"
                  name="date"
                  data-testid="date-input"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="input-field ltr-value"
                  disabled={!serviceId}
                />
                <p className="text-sm text-muted">
                  פתוחים א׳–ה׳, {businessSettings.startHour} –{" "}
                  {businessSettings.endHour}
                </p>

                {!serviceId || !appointmentDate ? (
                  <p className="rounded-2xl border border-dashed border-primary/20 bg-primary-soft/30 px-4 py-6 text-center text-sm text-muted">
                    בחרו שירות ותאריך כדי לראות שעות פנויות.
                  </p>
                ) : isClosedDay ? (
                  <p className="rounded-2xl border border-amber-200/60 bg-amber-50 px-4 py-6 text-center text-sm font-medium text-amber-800">
                    אנחנו סגורים ביום זה. אנא בחרו יום בין ראשון לחמישי.
                  </p>
                ) : availableSlots.length === 0 ? (
                  <p className="rounded-2xl border border-primary/15 bg-primary-soft/40 px-4 py-6 text-center text-sm font-medium text-[#111827]">
                    אין שעות פנויות לשירות זה בתאריך שנבחר.
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
                <h2 className="text-lg font-bold text-[#111827]">
                  3. פרטי לקוח
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2.5 block text-sm font-bold text-[#111827]"
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
                      className="mb-2.5 block text-sm font-bold text-[#111827]"
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
                    className="mb-2.5 block text-sm font-bold text-[#111827]"
                  >
                    הערות{" "}
                    <span className="font-normal text-muted">(אופציונלי)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    data-testid="notes-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="בקשות מיוחדות..."
                    className="input-field resize-none"
                  />
                </div>
              </section>

              <div className="border-t border-primary/10 pt-8">
                <Button
                  type="submit"
                  size="xl"
                  className="w-full sm:w-auto"
                  disabled={!isFormComplete}
                  data-testid="submit-booking-button"
                >
                  ← שליחת בקשת תור
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
