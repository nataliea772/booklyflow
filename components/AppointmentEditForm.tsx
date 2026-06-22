"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import { validateAppointmentSlot } from "@/lib/appointment-edit";
import {
  formatTimeLabel,
  getAvailableSlots,
  isDateFullyBlocked,
  isWorkingDay,
} from "@/lib/availability";
import { appointmentStatusLabels } from "@/lib/i18n";
import type {
  Appointment,
  AppointmentStatus,
  BlockedTime,
  BusinessSettings,
  Service,
} from "@/lib/types";

type AppointmentEditFormProps = {
  appointment: Appointment;
  services: Service[];
  appointments: Appointment[];
  businessSettings: BusinessSettings;
  blockedTimes?: BlockedTime[];
  onSave: (input: {
    serviceId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    notes?: string;
    adminNote?: string;
  }) => Promise<boolean>;
  onCancel: () => void;
};

export default function AppointmentEditForm({
  appointment,
  services,
  appointments,
  businessSettings,
  blockedTimes = [],
  onSave,
  onCancel,
}: AppointmentEditFormProps) {
  const [serviceId, setServiceId] = useState(appointment.serviceId);
  const [appointmentDate, setAppointmentDate] = useState(
    appointment.appointmentDate
  );
  const [startTime, setStartTime] = useState(appointment.startTime);
  const [customerName, setCustomerName] = useState(appointment.customerName);
  const [customerPhone, setCustomerPhone] = useState(appointment.customerPhone);
  const [customerEmail, setCustomerEmail] = useState(
    appointment.customerEmail ?? ""
  );
  const [notes, setNotes] = useState(appointment.notes ?? "");
  const [adminNote, setAdminNote] = useState(appointment.adminNote ?? "");
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedService = services.find((service) => service.id === serviceId);

  const availableSlots = useMemo(() => {
    if (!selectedService || !appointmentDate) return [];

    return getAvailableSlots({
      selectedDate: appointmentDate,
      selectedService,
      appointments,
      businessSettings,
      blockedTimes,
      excludeAppointmentId: appointment.id,
    });
  }, [
    selectedService,
    appointmentDate,
    appointments,
    businessSettings,
    blockedTimes,
    appointment.id,
  ]);

  const isClosedDay =
    Boolean(appointmentDate) && !isWorkingDay(appointmentDate, businessSettings);

  const isFullyBlockedDay =
    Boolean(appointmentDate) &&
    isDateFullyBlocked(appointmentDate, blockedTimes);

  const isInactiveStatus = status === "cancelled" || status === "completed";

  useEffect(() => {
    if (
      startTime &&
      !availableSlots.some((slot) => slot.startTime === startTime) &&
      !isInactiveStatus
    ) {
      setStartTime("");
    }
  }, [availableSlots, startTime, isInactiveStatus]);

  async function handleSubmit() {
    setError(null);

    if (!selectedService) {
      setError("יש לבחור שירות.");
      return;
    }

    if (!appointmentDate || !startTime) {
      setError("יש לבחור תאריך ושעה.");
      return;
    }

    const validation = validateAppointmentSlot({
      service: selectedService,
      appointmentDate,
      startTime,
      appointments,
      businessSettings,
      blockedTimes,
      excludeAppointmentId: appointment.id,
      status,
    });

    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setIsSaving(true);
    const success = await onSave({
      serviceId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      appointmentDate,
      startTime,
      endTime: validation.endTime,
      status,
      notes: notes.trim() || undefined,
      adminNote: adminNote.trim() || undefined,
    });
    setIsSaving(false);

    if (!success) {
      setError("לא הצלחנו לשמור את השינויים. נסו שוב.");
    }
  }

  return (
    <div
      className="mt-4 rounded-2xl border border-primary/12 bg-white/90 p-5 sm:p-6"
      data-testid={`appointment-edit-form-${appointment.id}`}
    >
      <p className="mb-4 text-sm font-bold text-primary">עריכת תור</p>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#111827]">
              שירות
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="input-field"
              data-testid={`edit-service-${appointment.id}`}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                  {!service.isActive ? " (לא פעיל)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#111827]">
              סטטוס
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
              className="input-field"
              data-testid={`edit-status-${appointment.id}`}
            >
              {(
                Object.keys(appointmentStatusLabels) as AppointmentStatus[]
              ).map((value) => (
                <option key={value} value={value}>
                  {appointmentStatusLabels[value]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#111827]">
              תאריך
            </label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="input-field ltr-value"
              data-testid={`edit-date-${appointment.id}`}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#111827]">
              שעה
            </label>
            {isClosedDay ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                העסק אינו פעיל ביום זה
              </p>
            ) : isFullyBlockedDay ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                התאריך שנבחר אינו זמין להזמנות
              </p>
            ) : availableSlots.length === 0 && !isInactiveStatus ? (
              <p className="rounded-xl border border-primary/15 bg-primary-soft/40 px-3 py-2.5 text-sm text-muted">
                אין שעות פנויות לתאריך זה
              </p>
            ) : isInactiveStatus ? (
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field ltr-value"
                data-testid={`edit-time-${appointment.id}`}
              />
            ) : (
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field ltr-value"
                data-testid={`edit-time-${appointment.id}`}
              >
                <option value="">בחרו שעה</option>
                {availableSlots.map((slot) => (
                  <option key={slot.startTime} value={slot.startTime}>
                    {formatTimeLabel(slot.startTime)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#111827]">
              שם לקוח
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-field"
              data-testid={`edit-customer-name-${appointment.id}`}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#111827]">
              טלפון
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="input-field ltr-value"
              data-testid={`edit-phone-${appointment.id}`}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#111827]">
            אימייל{" "}
            <span className="font-normal text-muted">(אופציונלי)</span>
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="input-field ltr-value"
            data-testid={`edit-email-${appointment.id}`}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#111827]">
            הערות לקוח
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field resize-none"
            data-testid={`edit-notes-${appointment.id}`}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#111827]">
            הערת מנהל{" "}
            <span className="font-normal text-muted">(פנימי — לא מוצג ללקוח)</span>
          </label>
          <textarea
            rows={2}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="input-field resize-none"
            data-testid={`edit-admin-note-${appointment.id}`}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={handleSubmit}
            data-testid={`save-appointment-${appointment.id}`}
          >
            {isSaving ? "שומר…" : "שמירת שינויים"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={onCancel}
            data-testid={`cancel-edit-appointment-${appointment.id}`}
          >
            ביטול
          </Button>
        </div>
      </div>
    </div>
  );
}
