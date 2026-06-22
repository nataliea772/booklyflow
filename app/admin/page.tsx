"use client";

import Link from "next/link";
import { useMemo } from "react";
import AdminNav from "@/components/AdminNav";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import { useAppointments } from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import { getTodayDateString } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const { appointments, resetDemoData } = useAppointments();
  const { services } = useServices();

  function getServicePrice(serviceId: string): number {
    return services.find((service) => service.id === serviceId)?.price ?? 0;
  }
  const today = getTodayDateString();

  const stats = useMemo(() => {
    const todayAppointments = appointments.filter(
      (appointment) =>
        appointment.appointmentDate === today &&
        appointment.status !== "cancelled"
    ).length;

    const pending = appointments.filter(
      (appointment) => appointment.status === "pending"
    ).length;

    const confirmed = appointments.filter(
      (appointment) => appointment.status === "confirmed"
    ).length;

    const revenue = appointments
      .filter((appointment) => appointment.status === "confirmed")
      .reduce(
        (total, appointment) => total + getServicePrice(appointment.serviceId),
        0
      );

    return { todayAppointments, pending, confirmed, revenue };
  }, [appointments, today]);

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

  const todayLabel = new Date(`${today}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <section className="page-header-bg">
        <div className="page-container relative py-14 sm:py-16 lg:py-20">
          <AdminNav />
          <Badge variant="primary" className="mb-5">
            Admin panel
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">
            Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-xl leading-relaxed text-muted">
            Overview of your business at a glance.
          </p>
          <button
            type="button"
            onClick={resetDemoData}
            className="mt-6 text-xs font-medium text-muted underline-offset-2 transition-colors hover:text-primary hover:underline"
          >
            Reset demo data
          </button>
        </div>
      </section>

      <div className="page-container py-12 sm:py-16 lg:py-20">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Today Appointments"
            value={stats.todayAppointments}
            icon="📅"
            trend="Scheduled for today"
            variant="primary"
            testId="dashboard-stat-today"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon="⏳"
            trend="Awaiting confirmation"
            variant="amber"
            testId="dashboard-stat-pending"
          />
          <StatCard
            label="Confirmed"
            value={stats.confirmed}
            icon="✅"
            trend="All confirmed bookings"
            variant="emerald"
            testId="dashboard-stat-confirmed"
          />
          <StatCard
            label="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon="💰"
            trend="From confirmed appointments"
            variant="secondary"
            testId="dashboard-stat-revenue"
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <Card elevated accent="primary" padding="lg">
            <h2 className="text-xl font-bold text-[#111827]">Quick Actions</h2>
            <p className="mt-2 text-base text-muted">Jump to common tasks</p>
            <ul className="mt-8 space-y-3">
              {[
                {
                  href: "/admin/appointments",
                  icon: "📋",
                  label: "View all appointments",
                  desc: "Manage your schedule",
                },
                {
                  href: "/admin/services",
                  icon: "✨",
                  label: "Manage services",
                  desc: "Update pricing & duration",
                },
                {
                  href: "/book",
                  icon: "🔗",
                  label: "Preview booking page",
                  desc: "See the client experience",
                },
              ].map((action) => (
                <li key={action.href}>
                  <Link
                    href={action.href}
                    className="group flex items-center gap-4 rounded-2xl border border-transparent bg-gradient-to-r from-primary-soft/50 to-white p-5 transition-all duration-200 hover:border-primary/15 hover:shadow-md"
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
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card elevated accent="secondary" padding="lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#111827]">
                  Today&apos;s Summary
                </h2>
                <p className="mt-2 text-base text-muted">{todayLabel}</p>
              </div>
              <Badge variant="secondary">{confirmRate}% confirmed</Badge>
            </div>
            <p className="mt-8 text-base leading-relaxed text-muted">
              You have{" "}
              <span className="font-bold text-primary">
                {stats.todayAppointments} appointments
              </span>{" "}
              scheduled for today with{" "}
              <span className="font-bold text-amber-600">
                {todayPending} pending
              </span>{" "}
              confirmation.
            </p>
            <div className="mt-8 rounded-2xl bg-primary-soft/60 p-6">
              <div className="mb-3 flex justify-between text-sm font-semibold text-[#111827]">
                <span>Confirmation rate</span>
                <span className="text-primary">{confirmRate}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                  style={{ width: `${confirmRate}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-muted">
                {todayConfirmed} confirmed of {todayActive} active today
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
