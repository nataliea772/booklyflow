"use client";

import { useEffect, useMemo, useState } from "react";
import AdminNav from "@/components/AdminNav";
import AppointmentEditForm from "@/components/AppointmentEditForm";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { useAppointments } from "@/hooks/useAppointments";
import { useBlockedTimes } from "@/hooks/useBlockedTimes";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useServices } from "@/hooks/useServices";
import { hasScheduleChanged } from "@/lib/appointment-schedule";
import {
  buildWhatsAppActionNotice,
  type WhatsAppActionNotice,
} from "@/lib/appointment-whatsapp-manual";
import {
  filterAppointmentsWithQuickRange,
  type AppointmentQuickFilter,
  type AppointmentStatusFilter,
} from "@/lib/appointment-filters";
import { groupAppointmentsByDay } from "@/lib/appointment-groups";
import { isAppointmentPast } from "@/lib/appointment-edit";
import { canDeleteAppointment } from "@/lib/appointment-delete";
import { formatTimeLabel, getServiceName } from "@/lib/availability";
import { getTodayDateString } from "@/lib/dates";
import {
  appointmentStatusLabels,
} from "@/lib/i18n";
import { sendAppointmentWhatsApp } from "@/lib/notifications/send-appointment-whatsapp";
import type { WhatsAppEventType } from "@/lib/whatsapp-messages";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const NOTICE_DISMISS_MS = 12000;

const statusStyles: Record<
  AppointmentStatus,
  { className: string; dot: string }
> = {
  pending: {
    className: "bg-amber-50 text-amber-800 ring-amber-200/80",
    dot: "bg-amber-500",
  },
  confirmed: {
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
    dot: "bg-emerald-500",
  },
  cancelled: {
    className: "bg-red-50 text-red-700 ring-red-200/80",
    dot: "bg-red-400",
  },
  completed: {
    className: "bg-slate-50 text-slate-700 ring-slate-200/80",
    dot: "bg-slate-500",
  },
};

const STATUS_FILTER_OPTIONS: {
  value: AppointmentStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "הכל" },
  { value: "pending", label: appointmentStatusLabels.pending },
  { value: "confirmed", label: appointmentStatusLabels.confirmed },
  { value: "cancelled", label: appointmentStatusLabels.cancelled },
  { value: "completed", label: appointmentStatusLabels.completed },
];

const QUICK_FILTER_OPTIONS: {
  value: AppointmentQuickFilter;
  label: string;
  testId: string;
}[] = [
  { value: "today", label: "היום", testId: "appointment-quick-filter-today" },
  {
    value: "tomorrow",
    label: "מחר",
    testId: "appointment-quick-filter-tomorrow",
  },
  { value: "week", label: "השבוע", testId: "appointment-quick-filter-week" },
  { value: "all", label: "הכל", testId: "appointment-quick-filter-all" },
];

export default function AppointmentsPage() {
  const { appointments, updateAppointment, updateAppointmentStatus, deleteAppointment, isReady } =
    useAppointments();
  const { services } = useServices();
  const { settings: businessSettings } = useBusinessSettings();
  const { blockedTimes } = useBlockedTimes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState<WhatsAppActionNotice | null>(
    null
  );
  const [deleteNotice, setDeleteNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [quickFilter, setQuickFilter] = useState<AppointmentQuickFilter>("all");
  const today = getTodayDateString();

  useEffect(() => {
    if (!confirmNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setConfirmNotice(null);
    }, NOTICE_DISMISS_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [confirmNotice]);

  useEffect(() => {
    if (!deleteNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDeleteNotice(null);
    }, NOTICE_DISMISS_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [deleteNotice]);

  function showWhatsAppNotice(
    appointment: Appointment,
    eventType: WhatsAppEventType,
    whatsAppResult: Awaited<ReturnType<typeof sendAppointmentWhatsApp>>
  ) {
    setConfirmNotice(
      buildWhatsAppActionNotice(
        appointment,
        eventType,
        whatsAppResult,
        services,
        businessSettings,
        window.location.origin
      )
    );
  }

  const filteredAppointments = useMemo(
    () =>
      filterAppointmentsWithQuickRange(
        appointments,
        {
          searchQuery,
          status: statusFilter,
          date: dateFilter,
        },
        quickFilter,
        today
      ),
    [appointments, searchQuery, statusFilter, dateFilter, quickFilter, today]
  );

  const groupedAppointments = useMemo(
    () => groupAppointmentsByDay(filteredAppointments),
    [filteredAppointments]
  );

  const statusCounts = useMemo(
    () =>
      appointments.reduce(
        (acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    [appointments]
  );

  async function handleSaveEdit(
    appointmentId: string,
    input: {
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
    }
  ): Promise<boolean> {
    const existing = appointments.find(
      (appointment) => appointment.id === appointmentId
    );

    if (!existing) {
      return false;
    }

    const scheduleChanged = hasScheduleChanged(existing, {
      serviceId: input.serviceId,
      appointmentDate: input.appointmentDate,
      startTime: input.startTime,
    });

    const updated = await updateAppointment(appointmentId, input);
    if (!updated) {
      return false;
    }

    setEditingId(null);

    if (scheduleChanged) {
      setConfirmNotice(null);
      const whatsAppResult = await sendAppointmentWhatsApp(
        appointmentId,
        "rescheduled"
      );
      showWhatsAppNotice(
        {
          ...existing,
          serviceId: input.serviceId,
          customerPhone: input.customerPhone,
          appointmentDate: input.appointmentDate,
          startTime: input.startTime,
        },
        "rescheduled",
        whatsAppResult
      );
    }

    return true;
  }

  async function handleConfirm(appointmentId: string) {
    setConfirmNotice(null);
    setConfirmingId(appointmentId);

    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) {
      setConfirmingId(null);
      return;
    }

    try {
      await updateAppointmentStatus(appointmentId, "confirmed");

      const whatsAppResult = await sendAppointmentWhatsApp(
        appointmentId,
        "confirmed"
      );
      showWhatsAppNotice(
        { ...appointment, status: "confirmed" },
        "confirmed",
        whatsAppResult
      );
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleCancel(appointmentId: string) {
    setConfirmNotice(null);
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) {
      return;
    }

    await updateAppointmentStatus(appointmentId, "cancelled");

    const whatsAppResult = await sendAppointmentWhatsApp(
      appointmentId,
      "cancelled"
    );
    showWhatsAppNotice(
      { ...appointment, status: "cancelled" },
      "cancelled",
      whatsAppResult
    );
  }

  async function handleComplete(appointmentId: string) {
    setConfirmNotice(null);
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) {
      return;
    }

    await updateAppointmentStatus(appointmentId, "completed");

    const whatsAppResult = await sendAppointmentWhatsApp(
      appointmentId,
      "review_request"
    );
    showWhatsAppNotice(
      { ...appointment, status: "completed" },
      "review_request",
      whatsAppResult
    );
  }

  async function handleDelete(appointmentId: string) {
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment || !canDeleteAppointment(appointment.status)) {
      return;
    }

    if (!window.confirm("האם למחוק את התור לצמיתות?")) {
      return;
    }

    setDeleteNotice(null);
    setDeletingId(appointmentId);

    try {
      const result = await deleteAppointment(appointmentId);

      if (result.ok) {
        setDeleteNotice({
          type: "success",
          message: "התור נמחק בהצלחה",
        });
        return;
      }

      if (result.code === "foreign_key") {
        setDeleteNotice({
          type: "error",
          message: "לא ניתן למחוק את התור כי קיימים נתונים מקושרים",
        });
        return;
      }

      setDeleteNotice({
        type: "error",
        message: "לא הצלחנו למחוק את התור",
      });
    } finally {
      setDeletingId(null);
    }
  }

  function handleQuickFilterChange(nextFilter: AppointmentQuickFilter) {
    setQuickFilter(nextFilter);
    setDateFilter("");
  }

  function handleDateFilterChange(value: string) {
    setDateFilter(value);
    if (value) {
      setQuickFilter("all");
    }
  }

  function renderAppointmentCard(appointment: Appointment) {
    const status = statusStyles[appointment.status];
    const canConfirm = appointment.status === "pending";
    const canComplete =
      appointment.status === "confirmed" ||
      appointment.status === "pending";
    const canCancel =
      appointment.status === "pending" ||
      appointment.status === "confirmed";
    const canDelete = canDeleteAppointment(appointment.status);
    const isPast = isAppointmentPast(appointment, today);
    const isEditing = editingId === appointment.id;

    return (
      <div
        key={appointment.id}
        className="list-card"
        data-testid={`appointment-row-${appointment.id}`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-bl from-charcoal to-rose text-sm font-bold text-white shadow-md shadow-rose/25">
              {appointment.customerName.charAt(0)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-bold text-[#111827]">
                  {appointment.customerName}
                </p>
                {isPast && (
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600 ring-1 ring-gray-200">
                    תור שעבר
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-primary">
                {getServiceName(services, appointment.serviceId)}
              </p>
              {appointment.notes && !isEditing && (
                <p className="mt-1.5 text-sm text-muted">{appointment.notes}</p>
              )}
              {appointment.adminNote && !isEditing && (
                <p className="mt-1.5 rounded-xl border border-primary/10 bg-primary-soft/30 px-3 py-2 text-sm text-[#111827]">
                  <span className="font-bold text-primary">הערת מנהל:</span>{" "}
                  {appointment.adminNote}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="rounded-xl bg-primary-soft/60 px-4 py-2.5">
              <p className="text-sm font-bold text-[#111827] ltr-value">
                {formatTimeLabel(appointment.startTime)} –{" "}
                {formatTimeLabel(appointment.endTime)}
              </p>
            </div>
            <p className="text-sm font-medium text-muted ltr-value">
              {appointment.customerPhone}
            </p>
            <span
              data-testid={`status-badge-${appointment.id}`}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ring-1 ring-inset ${status.className}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${status.dot}`}
                aria-hidden="true"
              />
              {appointmentStatusLabels[appointment.status]}
            </span>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditingId(isEditing ? null : appointment.id)
                }
                data-testid={`edit-appointment-${appointment.id}`}
              >
                {isEditing ? "סגירה" : "עריכה"}
              </Button>
              {canConfirm && (
                <Button
                  size="sm"
                  data-testid={`confirm-appointment-${appointment.id}`}
                  disabled={confirmingId === appointment.id}
                  onClick={() => handleConfirm(appointment.id)}
                >
                  {confirmingId === appointment.id ? "מאשר…" : "אישור"}
                </Button>
              )}
              {canComplete && (
                <Button
                  size="sm"
                  variant="outline"
                  data-testid={`complete-appointment-${appointment.id}`}
                  onClick={() => handleComplete(appointment.id)}
                >
                  סימון כהושלם
                </Button>
              )}
              {canCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancel(appointment.id)}
                >
                  ביטול
                </Button>
              )}
              {canDelete && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={deletingId === appointment.id}
                  onClick={() => handleDelete(appointment.id)}
                  data-testid={`delete-appointment-${appointment.id}`}
                  className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
                >
                  {deletingId === appointment.id ? "מוחק…" : "מחיקת תור"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <AppointmentEditForm
            appointment={appointment}
            services={services}
            appointments={appointments}
            businessSettings={businessSettings}
            blockedTimes={blockedTimes}
            onSave={(input) => handleSaveEdit(appointment.id, input)}
            onCancel={() => setEditingId(null)}
          />
        )}
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center py-20">
        <div className="loader-premium" role="status" aria-label="טוען" />
      </div>
    );
  }

  return (
    <>
      <div className="page-container pt-4 sm:pt-6">
        <AdminNav />
      </div>

      <div className="page-container pb-12 sm:pb-16">
        {deleteNotice && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium ${
              deleteNotice.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
            data-testid="delete-appointment-notice"
          >
            {deleteNotice.message}
          </div>
        )}

        {confirmNotice && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium ${
              confirmNotice.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-amber-200 bg-amber-50 text-amber-900"
            }`}
            data-testid="confirm-appointment-notice"
          >
            <p>{confirmNotice.message}</p>
            {confirmNotice.manualWhatsAppHref && (
              <a
                href={confirmNotice.manualWhatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="manual-whatsapp-link"
                className="mt-3 inline-flex items-center rounded-full bg-gradient-to-l from-charcoal to-rose px-4 py-2 text-xs font-bold text-white shadow-md transition-opacity hover:opacity-90"
              >
                שליחה ידנית ב-WhatsApp
              </a>
            )}
          </div>
        )}

        {appointments.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Badge variant="neutral">{appointments.length} סה״כ</Badge>
            {statusCounts.confirmed ? (
              <Badge variant="primary">
                ✅ {statusCounts.confirmed} מאושרים
              </Badge>
            ) : null}
            {statusCounts.pending ? (
              <Badge variant="secondary">
                ⏳ {statusCounts.pending} ממתינים
              </Badge>
            ) : null}
          </div>
        )}

        {appointments.length === 0 ? (
          <EmptyState
            icon="📋"
            title="אין תורים להצגה כרגע"
            description="כשלקוחות יזמינו תורים דרך דף ההזמנה, הם יופיעו כאן לאישור וניהול."
            action={{ label: "לדף ההזמנה", href: "/book" }}
          />
        ) : (
          <Card glass accent="primary" padding="lg">
            <CardHeader
              title="רשימת תורים"
              description="הזמנות אחרונות וקרובות"
            />

            <div
              className="mb-6 grid gap-4 rounded-2xl border border-primary/10 bg-white/80 p-4 sm:grid-cols-2 lg:grid-cols-4"
              data-testid="appointments-filter-panel"
            >
              <div className="sm:col-span-2 lg:col-span-4">
                <p className="mb-2 block text-sm font-bold text-[#111827]">
                  סינון מהיר
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_FILTER_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      variant={
                        quickFilter === option.value ? "primary" : "outline"
                      }
                      data-testid={option.testId}
                      onClick={() => handleQuickFilterChange(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                <label
                  htmlFor="appointment-search"
                  className="mb-2 block text-sm font-bold text-[#111827]"
                >
                  חיפוש
                </label>
                <input
                  id="appointment-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חיפוש לפי שם או טלפון"
                  className="input-field"
                  data-testid="appointment-search-input"
                />
              </div>

              <div>
                <label
                  htmlFor="appointment-status-filter"
                  className="mb-2 block text-sm font-bold text-[#111827]"
                >
                  סטטוס
                </label>
                <select
                  id="appointment-status-filter"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as AppointmentStatusFilter)
                  }
                  className="input-field"
                  data-testid="appointment-status-filter"
                >
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="appointment-date-filter"
                  className="mb-2 block text-sm font-bold text-[#111827]"
                >
                  תאריך
                </label>
                <div className="flex gap-2">
                  <input
                    id="appointment-date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    className="input-field ltr-value min-w-0 flex-1"
                    data-testid="appointment-date-filter"
                  />
                  {dateFilter && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateFilter("");
                        setQuickFilter("all");
                      }}
                      data-testid="appointment-date-filter-clear"
                    >
                      ניקוי
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="אין תורים שתואמים לחיפוש"
                description="נסו לשנות את מילות החיפוש, הסטטוס או התאריך."
              />
            ) : (
            <div className="space-y-8">
              {groupedAppointments.map((group) => (
                <section
                  key={group.date}
                  className="space-y-4"
                  data-testid={`appointment-day-group-${group.date}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 pb-3">
                    <h3 className="text-lg font-extrabold text-[#111827]">
                      {group.label}
                    </h3>
                    <Badge variant="neutral">
                      {group.appointments.length} תורים
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {group.appointments.map((appointment) =>
                      renderAppointmentCard(appointment)
                    )}
                  </div>
                </section>
              ))}
            </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
