"use client";

import Link from "next/link";
import { useMemo } from "react";
import AdminNav from "@/components/AdminNav";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import StatCard from "@/components/StatCard";
import { useAppointments } from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import { formatTimeLabel, getServiceName } from "@/lib/availability";
import { groupAppointmentsByDay } from "@/lib/appointment-groups";
import {
  calculateExpectedRevenue,
  getUpcomingAppointments,
} from "@/lib/dashboard-stats";
import { getTodayDateString } from "@/lib/dates";
import {
  appointmentStatusLabels,
  formatCurrency,
  formatShortDate,
} from "@/lib/i18n";

export default function AdminDashboardPage() {
  const { appointments, isReady } = useAppointments();
  const { services } = useServices();
  const today = getTodayDateString();

  function getServicePrice(serviceId: string): number {
    return services.find((service) => service.id === serviceId)?.price ?? 0;
  }

  const stats = useMemo(() => {
    const todayAppointments = appointments.filter(
      (appointment) =>
        appointment.appointmentDate === today &&
        appointment.status !== "cancelled" &&
        appointment.status !== "completed"
    ).length;

    const pending = appointments.filter(
      (appointment) => appointment.status === "pending"
    ).length;

    const confirmed = appointments.filter(
      (appointment) => appointment.status === "confirmed"
    ).length;

    const revenue = calculateExpectedRevenue(
      appointments,
      getServicePrice,
      today
    );

    return { todayAppointments, pending, confirmed, revenue };
  }, [appointments, today, services]);

  const upcomingAppointments = useMemo(
    () => getUpcomingAppointments(appointments, today, 7),
    [appointments, today]
  );

  const upcomingGroups = useMemo(
    () => groupAppointmentsByDay(upcomingAppointments),
    [upcomingAppointments]
  );

  const todayPending = appointments.filter(
    (appointment) =>
      appointment.appointmentDate === today &&
      appointment.status === "pending"
  ).length;

  const todayConfirmed = appointments.filter(
    (appointment) =>
      appointment.appointmentDate === today &&
      appointment.status === "confirmed"
  ).length;

  const todayActive = todayPending + todayConfirmed;
  const confirmRate =
    todayActive > 0
      ? Math.round((todayConfirmed / todayActive) * 100)
      : 0;

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
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="תורים להיום"
            value={stats.todayAppointments}
            icon="📅"
            trend="מתוזמנים להיום"
            variant="primary"
            testId="dashboard-stat-today"
          />
          <StatCard
            label="ממתינים לאישור"
            value={stats.pending}
            icon="⏳"
            trend="דורשים טיפול"
            variant="amber"
            testId="dashboard-stat-pending"
          />
          <StatCard
            label="תורים מאושרים"
            value={stats.confirmed}
            icon="✅"
            trend="כל ההזמנות המאושרות"
            variant="emerald"
            testId="dashboard-stat-confirmed"
          />
          <StatCard
            label="הכנסות צפויות"
            value={formatCurrency(stats.revenue)}
            icon="💰"
            trend="מתורים מאושרים עתידיים"
            variant="secondary"
            testId="dashboard-stat-revenue"
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Card glass accent="primary" padding="lg">
            <p className="section-eyebrow">קיצורי דרך</p>
            <h2 className="mt-2 text-xl font-extrabold text-[#111827] sm:text-2xl">
              פעולות מהירות
            </h2>
            <p className="mt-2 text-base text-muted">מעבר למשימות נפוצות</p>
            <ul className="mt-8 space-y-3">
              {[
                {
                  href: "/admin/business",
                  icon: "🏢",
                  label: "פרטי העסק",
                  desc: "לוגו, כיסוי ופרטי קשר",
                },
                {
                  href: "/admin/appointments",
                  icon: "📋",
                  label: "ניהול תורים",
                  desc: "צפייה ואישור הזמנות",
                },
                {
                  href: "/admin/services",
                  icon: "✨",
                  label: "ניהול שירותים",
                  desc: "הוספה ועריכת שירותים",
                },
                {
                  href: "/book",
                  icon: "🔗",
                  label: "דף הזמנה ללקוחות",
                  desc: "תצוגת חוויית ההזמנה",
                },
              ].map((action) => (
                <li key={action.href}>
                  <Link
                    href={action.href}
                    className="group flex items-center gap-4 rounded-2xl border border-primary/8 bg-white/70 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[var(--card-shadow)]"
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-primary/10 transition-all duration-200 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20"
                      aria-hidden="true"
                    >
                      {action.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#111827] group-hover:text-primary">
                        {action.label}
                      </p>
                      <p className="mt-0.5 text-sm text-muted">{action.desc}</p>
                    </div>
                    <span className="text-xl text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      ←
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card glass accent="secondary" padding="lg">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">פעילות</p>
                <h2 className="mt-2 text-xl font-extrabold text-[#111827] sm:text-2xl">
                  תורים קרובים
                </h2>
                <p className="mt-2 text-base text-muted">
                  {upcomingAppointments.length > 0
                    ? "התורים הבאים בעסק"
                    : "אין תורים קרובים להצגה"}
                </p>
              </div>
              {upcomingAppointments.length > 0 && (
                <Badge variant="secondary">{confirmRate}% מאושרים היום</Badge>
              )}
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="mt-8">
                <EmptyState
                  compact
                  icon="📅"
                  title="אין תורים קרובים"
                  description="כשיתקבלו הזמנות חדשות לימים הקרובים, הן יופיעו כאן."
                  action={{ label: "לדף ההזמנה", href: "/book" }}
                />
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                {upcomingGroups.map((group) => (
                  <div key={group.date}>
                    <p className="mb-3 text-sm font-bold text-primary">
                      {group.label}
                    </p>
                    <ul className="space-y-3">
                      {group.appointments.map((appointment) => (
                        <li
                          key={appointment.id}
                          className="list-card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                          data-testid={`dashboard-upcoming-${appointment.id}`}
                        >
                          <div>
                            <p className="font-bold text-[#111827]">
                              {appointment.customerName}
                            </p>
                            <p className="text-sm text-primary">
                              {getServiceName(services, appointment.serviceId)}
                            </p>
                          </div>
                          <div className="text-sm text-muted">
                            <p className="ltr-value">
                              {formatTimeLabel(appointment.startTime)}
                            </p>
                            <p className="mt-1 font-semibold text-[#111827]">
                              {appointmentStatusLabels[appointment.status]}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
