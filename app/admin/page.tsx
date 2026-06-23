"use client";

import Link from "next/link";
import { useMemo } from "react";
import AdminNav from "@/components/AdminNav";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { DashboardStatsSkeleton } from "@/components/LoadingSkeleton";
import StatCard from "@/components/StatCard";
import { useAppointments } from "@/hooks/useAppointments";
import { useReviews } from "@/hooks/useReviews";
import { useServices } from "@/hooks/useServices";
import { formatTimeLabel, getServiceName } from "@/lib/availability";
import { groupAppointmentsByDay } from "@/lib/appointment-groups";
import {
  getAverageReviewRating,
  getCancellationRatePercent,
  getConfirmedAppointmentsForNextWeek,
  getMostPopularService,
  getTodayAppointmentsCount,
  getTodayExpectedRevenue,
  getWeekAppointmentsCount,
} from "@/lib/dashboard-stats";
import { getTodayDateString } from "@/lib/dates";
import {
  appointmentStatusLabels,
  formatCurrency,
} from "@/lib/i18n";

export default function AdminDashboardPage() {
  const { appointments, isReady: appointmentsReady } = useAppointments();
  const { services, isReady: servicesReady } = useServices();
  const { reviews, isReady: reviewsReady } = useReviews();
  const today = getTodayDateString();

  const isReady = appointmentsReady && servicesReady && reviewsReady;

  function getServicePrice(serviceId: string): number {
    return services.find((service) => service.id === serviceId)?.price ?? 0;
  }

  const stats = useMemo(() => {
    const todayCount = getTodayAppointmentsCount(appointments, today);
    const weekCount = getWeekAppointmentsCount(appointments, today);
    const revenue = getTodayExpectedRevenue(
      appointments,
      getServicePrice,
      today
    );
    const popular = getMostPopularService(appointments);
    const popularName = popular
      ? getServiceName(services, popular.serviceId)
      : "—";
    const averageRating = getAverageReviewRating(reviews);
    const cancellationRate = getCancellationRatePercent(appointments);

    return {
      todayCount,
      weekCount,
      revenue,
      popularName,
      popularCount: popular?.count ?? 0,
      averageRating,
      cancellationRate,
    };
  }, [appointments, today, services, reviews]);

  const confirmedWeekAppointments = useMemo(
    () => getConfirmedAppointmentsForNextWeek(appointments, today, 7),
    [appointments, today]
  );

  const confirmedWeekGroups = useMemo(
    () => groupAppointmentsByDay(confirmedWeekAppointments),
    [confirmedWeekAppointments]
  );

  if (!isReady) {
    return (
      <>
        <div className="page-container pt-4 sm:pt-6">
          <AdminNav />
        </div>
        <div className="page-container pb-12">
          <DashboardStatsSkeleton />
          <p className="mt-6 text-center text-sm font-semibold text-muted">
            טוען לוח בקרה…
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-container pt-4 sm:pt-6">
        <AdminNav />
      </div>

      <div className="page-container pb-12 sm:pb-16">
        <div className="mb-8">
          <p className="section-eyebrow">סקירה</p>
          <h1 className="mt-2 text-2xl font-extrabold text-charcoal sm:text-3xl">
            לוח בקרה
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="תורים היום"
            value={stats.todayCount}
            icon="📅"
            trend="כל התורים שלא בוטלו"
            testId="dashboard-stat-today"
          />
          <StatCard
            label="תורים השבוע"
            value={stats.weekCount}
            icon="🗓️"
            trend="7 ימים קדימה"
            testId="dashboard-stat-week"
          />
          <StatCard
            label="הכנסות צפויות היום"
            value={formatCurrency(stats.revenue)}
            icon="💰"
            trend="מתורים מאושרים להיום"
            testId="dashboard-stat-revenue"
          />
          <StatCard
            label="שירות הכי פופולרי"
            value={stats.popularName}
            icon="✨"
            trend={
              stats.popularCount > 0
                ? `${stats.popularCount} תורים`
                : "אין נתונים עדיין"
            }
            testId="dashboard-stat-popular-service"
          />
          <StatCard
            label="דירוג ממוצע"
            value={
              stats.averageRating !== null ? `${stats.averageRating}` : "—"
            }
            icon="⭐"
            trend="מביקורות גלויות"
            testId="dashboard-stat-average-rating"
          />
          <StatCard
            label="אחוז ביטולים"
            value={`${stats.cancellationRate}%`}
            icon="📉"
            trend="מכלל התורים"
            testId="dashboard-stat-cancellation-rate"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-6">
          <Card glass accent="none" padding="md">
            <p className="section-eyebrow">קיצורי דרך</p>
            <h2 className="mt-2 text-xl font-extrabold text-charcoal sm:text-2xl">
              פעולות מהירות
            </h2>
            <p className="mt-2 text-base text-muted">מעבר למשימות נפוצות</p>
            <ul className="mt-6 space-y-3">
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
                    className="group flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4 transition-all duration-200 hover:border-black/20 hover:shadow-[var(--card-shadow)]"
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-charcoal text-lg text-white shadow-sm transition-colors duration-200 group-hover:bg-black"
                      aria-hidden="true"
                    >
                      {action.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-charcoal">{action.label}</p>
                      <p className="mt-0.5 text-sm text-muted">{action.desc}</p>
                    </div>
                    <span className="text-xl text-charcoal opacity-0 transition-opacity group-hover:opacity-100">
                      ←
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card glass accent="none" padding="md">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">פעילות</p>
                <h2 className="mt-2 text-xl font-extrabold text-charcoal sm:text-2xl">
                  תורים מאושרים השבוע
                </h2>
                <p className="mt-2 text-base text-muted">
                  {confirmedWeekAppointments.length > 0
                    ? "תורים מאושרים לשבוע הקרוב"
                    : "אין תורים מאושרים לשבוע הקרוב"}
                </p>
              </div>
              {confirmedWeekAppointments.length > 0 && (
                <Badge variant="neutral">
                  {confirmedWeekAppointments.length} תורים
                </Badge>
              )}
            </div>

            {confirmedWeekAppointments.length === 0 ? (
              <div className="mt-8">
                <EmptyState
                  compact
                  icon="📅"
                  title="אין תורים להיום"
                  description="כשיתקבלו הזמנות מאושרות לימים הקרובים, הן יופיעו כאן."
                  action={{ label: "לדף ההזמנה", href: "/book" }}
                />
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                {confirmedWeekGroups.map((group) => (
                  <div key={group.date}>
                    <p className="mb-3 text-sm font-bold text-charcoal">
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
                            <p className="font-bold text-charcoal">
                              {appointment.customerName}
                            </p>
                            <p className="text-sm text-muted">
                              {getServiceName(services, appointment.serviceId)}
                            </p>
                          </div>
                          <div className="text-sm text-muted">
                            <p className="ltr-value">
                              {formatTimeLabel(appointment.startTime)}
                            </p>
                            <p className="mt-1 font-semibold text-charcoal">
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
