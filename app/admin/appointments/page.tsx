"use client";

import { useMemo } from "react";
import AdminNav from "@/components/AdminNav";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { useAppointments } from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import { formatTimeLabel, getServiceName } from "@/lib/availability";
import {
  appointmentStatusLabels,
  formatShortDate,
} from "@/lib/i18n";
import type { AppointmentStatus } from "@/lib/types";

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
};

export default function AppointmentsPage() {
  const { appointments, updateAppointmentStatus, isReady } = useAppointments();
  const { services } = useServices();

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
            צפייה, אישור וביטול של הזמנות לקוחות.
          </p>

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

            <div className="space-y-4">
              {appointments.map((appointment) => {
                const status = statusStyles[appointment.status];
                const canConfirm = appointment.status === "pending";
                const canCancel =
                  appointment.status === "pending" ||
                  appointment.status === "confirmed";

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
                          <p className="text-lg font-bold text-[#111827]">
                            {appointment.customerName}
                          </p>
                          <p className="mt-1 text-sm font-medium text-primary">
                            {getServiceName(services, appointment.serviceId)}
                          </p>
                          {appointment.notes && (
                            <p className="mt-1.5 text-sm text-muted">
                              {appointment.notes}
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

                        {(canConfirm || canCancel) && (
                          <div className="flex flex-wrap gap-2">
                            {canConfirm && (
                              <Button
                                size="sm"
                                data-testid={`confirm-appointment-${appointment.id}`}
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "confirmed"
                                  )
                                }
                              >
                                אישור
                              </Button>
                            )}
                            {canCancel && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    "cancelled"
                                  )
                                }
                              >
                                ביטול
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
