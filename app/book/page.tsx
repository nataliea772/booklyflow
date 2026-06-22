"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import { useAppointments } from "@/hooks/useAppointments";
import {
  calculateEndTime,
  findService,
  formatTimeLabel,
  getAvailableSlots,
  isWorkingDay,
} from "@/lib/availability";
import { businessSettings, services } from "@/lib/mock-data";
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

function formatDisplayDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookPage() {
  const { appointments, addAppointment } = useAppointments();
  const [serviceId, setServiceId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bookedAppointment, setBookedAppointment] =
    useState<BookedAppointment | null>(null);

  const selectedService = useMemo(
    () => findService(services, serviceId),
    [serviceId]
  );

  const availableSlots: TimeSlot[] = useMemo(() => {
    if (!selectedService || !appointmentDate) return [];

    return getAvailableSlots({
      selectedDate: appointmentDate,
      selectedService,
      appointments,
      businessSettings,
    });
  }, [selectedService, appointmentDate, appointments]);

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

  if (bookedAppointment) {
    return (
      <div className="page-container py-20 sm:py-28">
        <div className="mx-auto max-w-lg">
          <Card padding="lg" elevated accent="primary" className="text-center">
            <span
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-4xl ring-1 ring-emerald-200/60"
              role="img"
              aria-hidden="true"
            >
              ✅
            </span>
            <h1
              className="mt-8 text-3xl font-bold text-[#111827]"
              data-testid="booking-success-message"
            >
              Booking Request Received!
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Thank you, {bookedAppointment.customerName}. Your appointment at{" "}
              {businessSettings.businessName} has been submitted.
            </p>

            <div className="mt-8 rounded-2xl border border-primary/10 bg-primary-soft/40 p-6 text-left">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted">
                Appointment details
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Service</dt>
                  <dd className="font-semibold text-[#111827]">
                    {bookedAppointment.serviceName}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Date</dt>
                  <dd className="font-semibold text-[#111827]">
                    {formatDisplayDate(bookedAppointment.appointmentDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Time</dt>
                  <dd className="font-semibold text-[#111827]">
                    {formatTimeLabel(bookedAppointment.startTime)} –{" "}
                    {formatTimeLabel(bookedAppointment.endTime)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Phone</dt>
                  <dd className="font-semibold text-[#111827]">
                    {bookedAppointment.customerPhone}
                  </dd>
                </div>
                {bookedAppointment.notes && (
                  <div>
                    <dt className="text-muted">Notes</dt>
                    <dd className="mt-1 font-medium text-[#111827]">
                      {bookedAppointment.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button href="/" variant="outline" size="lg">
                Back to Home
              </Button>
              <Button onClick={resetBooking} size="lg">
                Book Another
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        badge="📅 Online booking"
        title="Book an Appointment"
        description={`Choose your service at ${businessSettings.businessName}, pick an available time, and we'll take care of the rest.`}
      >
        <div className="flex flex-wrap gap-3">
          {["Free cancellation", "Instant confirmation", "Secure & private"].map(
            (item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-[#111827] shadow-[var(--card-shadow)] ring-1 ring-primary/10"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">
                  ✓
                </span>
                {item}
              </span>
            )
          )}
        </div>
      </PageHeader>

      <div className="page-container py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <Card padding="lg" elevated accent="primary">
            <CardHeader
              title="Appointment Details"
              description="Select a service and date to see available time slots."
            />

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label
                  htmlFor="service"
                  className="mb-2.5 block text-sm font-bold text-[#111827]"
                >
                  Service
                </label>
                <select
                  id="service"
                  name="service"
                  data-testid="service-select"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a service</option>
                  {services
                    .filter((service) => service.isActive)
                    .map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} — {service.durationMinutes} min — $
                        {service.price === 0 ? "Free" : service.price}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="mb-2.5 block text-sm font-bold text-[#111827]"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  data-testid="date-input"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="input-field"
                />
                <p className="mt-2 text-sm text-muted">
                  Open Sunday – Thursday, {businessSettings.startHour} –{" "}
                  {businessSettings.endHour}
                </p>
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-bold text-[#111827]">
                  Available Times
                </label>

                {!serviceId || !appointmentDate ? (
                  <p className="rounded-2xl border border-dashed border-primary/20 bg-primary-soft/30 px-4 py-6 text-center text-sm text-muted">
                    Select a service and date to view available slots.
                  </p>
                ) : isClosedDay ? (
                  <p className="rounded-2xl border border-amber-200/60 bg-amber-50 px-4 py-6 text-center text-sm font-medium text-amber-800">
                    We&apos;re closed on this day. Please choose a day between
                    Sunday and Thursday.
                  </p>
                ) : availableSlots.length === 0 ? (
                  <p className="rounded-2xl border border-primary/15 bg-primary-soft/40 px-4 py-6 text-center text-sm font-medium text-[#111827]">
                    No available slots for this service on the selected date.
                    Try another date or service.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedStartTime === slot.startTime;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          data-testid={`time-slot-${slot.startTime}`}
                          onClick={() => setSelectedStartTime(slot.startTime)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
                              : "border-primary/15 bg-white text-[#111827] hover:border-primary/30 hover:bg-primary-light/50 hover:shadow-md"
                          }`}
                        >
                          {formatTimeLabel(slot.startTime)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2.5 block text-sm font-bold text-[#111827]"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    data-testid="customer-name-input"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Jane Smith"
                    className="input-field"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2.5 block text-sm font-bold text-[#111827]"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    data-testid="phone-input"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="mb-2.5 block text-sm font-bold text-[#111827]"
                >
                  Notes{" "}
                  <span className="font-normal text-muted">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  data-testid="notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Any special requests or preferences..."
                  className="input-field resize-none"
                />
              </div>

              <div className="border-t border-primary/10 pt-8">
                <Button
                  type="submit"
                  size="xl"
                  className="w-full sm:w-auto"
                  disabled={!isFormComplete}
                  data-testid="submit-booking-button"
                >
                  Request Appointment →
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
