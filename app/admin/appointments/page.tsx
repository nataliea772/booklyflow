"use client";

import { useMemo, useState } from "react";
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
import { isAppointmentPast } from "@/lib/appointment-edit";
import {
  filterAppointments,
  type AppointmentStatusFilter,
} from "@/lib/appointment-filters";
import { formatTimeLabel, getServiceName } from "@/lib/availability";
import { getTodayDateString } from "@/lib/dates";
import {
  appointmentStatusLabels,
  formatShortDate,
} from "@/lib/i18n";
import { sendAppointmentSms } from "@/lib/notifications/send-appointment-sms";
import type { AppointmentStatus } from "@/lib/types";

type ConfirmNotice = {
  type: "success" | "warning";
  message: string;
};

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

export default function AppointmentsPage() {
  const { appointments, updateAppointment, updateAppointmentStatus, isReady } =
    useAppointments();
  const { services } = useServices();
  const { settings: businessSettings } = useBusinessSettings();
  const { blockedTimes } = useBlockedTimes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState<ConfirmNotice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const today = getTodayDateString();

  const filteredAppointments = useMemo(
    () =>
      filterAppointments(appointments, {
        searchQuery,
        status: statusFilter,
        date: dateFilter,
      }),
    [appointments, searchQuery, statusFilter, dateFilter]
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
      const smsResult = await sendAppointmentSms(appointmentId, "rescheduled");
      setConfirmNotice(
        smsResult.success
          ? {
              type: "success",
              message: "התור עודכן ונשלחה הודעת SMS",
            }
          : {
              type: "warning",
              message: "התור עודכן, אך שליחת ה-SMS נכשלה",
            }
      );
    }

    return true;
  }

  async function handleConfirm(appointmentId: string) {
    setConfirmNotice(null);
    setConfirmingId(appointmentId);

    try {
      await updateAppointmentStatus(appointmentId, "confirmed");

      const smsResult = await sendAppointmentSms(appointmentId, "confirmed");
      setConfirmNotice(
        smsResult.success
          ? {
              type: "success",
              message: "התור אושר ונשלחה הודעת SMS ללקוחה",
            }
          : {
              type: "warning",
              message: "התור אושר, אך שליחת ה-SMS נכשלה",
            }
      );
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleCancel(appointmentId: string) {
    setConfirmNotice(null);
    await updateAppointmentStatus(appointmentId, "cancelled");

    const smsResult = await sendAppointmentSms(appointmentId, "cancelled");
    setConfirmNotice(
      smsResult.success
        ? {
            type: "success",
            message: "התור בוטל ונשלחה הודעת SMS",
          }
        : {
            type: "warning",
            message: "התור בוטל, אך שליחת ה-SMS נכשלה",
          }
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
      <section className="page-header-bg">
        <div className="page-container relative py-14 sm:py-16 lg:py-20">
          <AdminNav />
          <Badge variant="primary" className="mb-5">
            ניהול תורים
          </Badge>
          <h1 className="display-section">כל התורים</h1>
          <p className="lead mt-4 max-w-2xl">
            צפייה, עריכה, אישור וביטול של הזמנות לקוחות.
          </p>

          {confirmNotice && (
            <p
              className={`mt-6 rounded-2xl px-4 py-3 text-sm font-medium ${
                confirmNotice.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-amber-200 bg-amber-50 text-amber-900"
              }`}
              data-testid="confirm-appointment-notice"
            >
              {confirmNotice.message}
            </p>
          )}

          {appointments.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
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
        </div>
      </section>

      <div className="page-container py-12 sm:py-16 lg:py-20">
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
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="input-field ltr-value min-w-0 flex-1"
                    data-testid="appointment-date-filter"
                  />
                  {dateFilter && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDateFilter("")}
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
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => {
                const status = statusStyles[appointment.status];
                const canConfirm = appointment.status === "pending";
                const canComplete =
                  appointment.status === "confirmed" ||
                  appointment.status === "pending";
                const canCancel =
                  appointment.status === "pending" ||
                  appointment.status === "confirmed";
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
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-bl from-primary to-[#8b5cf6] text-sm font-bold text-white shadow-md shadow-primary/25">
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
                            <p className="mt-1.5 text-sm text-muted">
                              {appointment.notes}
                            </p>
                          )}
                          {appointment.adminNote && !isEditing && (
                            <p className="mt-1.5 rounded-xl border border-primary/10 bg-primary-soft/30 px-3 py-2 text-sm text-[#111827]">
                              <span className="font-bold text-primary">
                                הערת מנהל:
                              </span>{" "}
                              {appointment.adminNote}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                        <div className="rounded-xl bg-primary-soft/60 px-4 py-2.5">
                          <p className="text-sm font-bold text-[#111827]">
                            {formatShortDate(appointment.appointmentDate)}
                          </p>
                          <p className="text-sm text-muted ltr-value">
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
                              {confirmingId === appointment.id
                                ? "מאשר…"
                                : "אישור"}
                            </Button>
                          )}
                          {canComplete && (
                            <Button
                              size="sm"
                              variant="outline"
                              data-testid={`complete-appointment-${appointment.id}`}
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "completed"
                                )
                              }
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
                        onSave={(input) =>
                          handleSaveEdit(appointment.id, input)
                        }
                        onCancel={() => setEditingId(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
