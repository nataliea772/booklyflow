"use client";

import { useMemo } from "react";
import AdminNav from "@/components/AdminNav";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
import { useAppointments } from "@/hooks/useAppointments";
import { formatTimeLabel, getServiceName } from "@/lib/availability";
import { services } from "@/lib/mock-data";
import type { AppointmentStatus } from "@/lib/types";

const statusStyles: Record<
  AppointmentStatus,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-800 ring-amber-200/80",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 ring-red-200/80",
    dot: "bg-red-400",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AppointmentsPage() {
  const { appointments, updateAppointmentStatus, resetDemoData } =
    useAppointments();

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

  return (
    <>
      <section className="page-header-bg">
        <div className="page-container relative py-14 sm:py-16 lg:py-20">
          <AdminNav />
          <Badge variant="primary" className="mb-5">
            Schedule
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">
            Appointments
          </h1>
          <p className="mt-4 max-w-2xl text-xl leading-relaxed text-muted">
            View and manage all customer appointments.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Badge variant="neutral">{appointments.length} total</Badge>
            {statusCounts.confirmed ? (
              <Badge variant="primary">
                ✅ {statusCounts.confirmed} confirmed
              </Badge>
            ) : null}
            {statusCounts.pending ? (
              <Badge variant="secondary">
                ⏳ {statusCounts.pending} pending
              </Badge>
            ) : null}
            <button
              type="button"
              onClick={resetDemoData}
              className="ml-auto text-xs font-medium text-muted underline-offset-2 transition-colors hover:text-primary hover:underline"
            >
              Reset demo data
            </button>
          </div>
        </div>
      </section>

      <div className="page-container py-12 sm:py-16 lg:py-20">
        <Card elevated accent="primary" padding="lg">
          <CardHeader
            title="All Appointments"
            description="Recent and upcoming bookings"
          />

          <div className="space-y-4">
            {appointments.map((appointment) => {
              const status = statusStyles[appointment.status];
              const canConfirm = appointment.status === "pending";
              const canCancel =
                appointment.status === "pending" ||
                appointment.status === "confirmed";

              return (
                <div key={appointment.id} className="list-card">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#9333ea] text-sm font-bold text-white shadow-md shadow-primary/25">
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
                          {formatDate(appointment.appointmentDate)}
                        </p>
                        <p className="text-sm text-muted">
                          {formatTimeLabel(appointment.startTime)} –{" "}
                          {formatTimeLabel(appointment.endTime)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-muted">
                        {appointment.customerPhone}
                      </p>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ring-1 ring-inset ${status.className}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${status.dot}`}
                          aria-hidden="true"
                        />
                        {status.label}
                      </span>

                      {(canConfirm || canCancel) && (
                        <div className="flex flex-wrap gap-2">
                          {canConfirm && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "confirmed"
                                )
                              }
                            >
                              Confirm
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
                              Cancel
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
      </div>
    </>
  );
}
