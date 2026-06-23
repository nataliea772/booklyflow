import { addDaysToDateString, getTodayDateString } from "@/lib/dates";
import type { Appointment, CustomerReview } from "./types";

export type ServicePriceLookup = (serviceId: string) => number;

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function sortAppointmentsByDateAndTime(
  a: Appointment,
  b: Appointment
): number {
  const dateCompare = a.appointmentDate.localeCompare(b.appointmentDate);
  if (dateCompare !== 0) {
    return dateCompare;
  }

  return a.startTime.localeCompare(b.startTime);
}

/** True when appointment is today or later and its start time has not passed. */
export function isUpcomingAppointment(
  appointment: Appointment,
  today: string,
  now: Date = new Date()
): boolean {
  if (
    appointment.status === "cancelled" ||
    appointment.status === "completed"
  ) {
    return false;
  }

  if (appointment.appointmentDate > today) {
    return true;
  }

  if (appointment.appointmentDate < today) {
    return false;
  }

  return timeToMinutes(appointment.startTime) >= now.getHours() * 60 + now.getMinutes();
}

/** Confirmed appointments from today onward whose start time has not passed. */
export function isConfirmedUpcomingAppointment(
  appointment: Appointment,
  today: string,
  now: Date = new Date()
): boolean {
  return (
    appointment.status === "confirmed" &&
    isUpcomingAppointment(appointment, today, now)
  );
}

/** @deprecated Use getTodayExpectedRevenue for dashboard revenue. */
export function calculateExpectedRevenue(
  appointments: Appointment[],
  getServicePrice: ServicePriceLookup,
  today: string,
  now: Date = new Date()
): number {
  return appointments
    .filter((appointment) =>
      isConfirmedUpcomingAppointment(appointment, today, now)
    )
    .reduce(
      (total, appointment) => total + getServicePrice(appointment.serviceId),
      0
    );
}

/** Sum of confirmed appointment prices for today only. */
export function getTodayExpectedRevenue(
  appointments: Appointment[],
  getServicePrice: ServicePriceLookup,
  today: string = getTodayDateString()
): number {
  return appointments
    .filter(
      (appointment) =>
        appointment.appointmentDate === today &&
        appointment.status === "confirmed"
    )
    .reduce(
      (total, appointment) => total + getServicePrice(appointment.serviceId),
      0
    );
}

export function getUpcomingAppointments(
  appointments: Appointment[],
  today: string,
  limit = 5,
  now: Date = new Date()
): Appointment[] {
  return appointments
    .filter((appointment) => isUpcomingAppointment(appointment, today, now))
    .sort(sortAppointmentsByDateAndTime)
    .slice(0, limit);
}

/** Confirmed appointments from today through seven days ahead (inclusive). */
export function getConfirmedAppointmentsForNextWeek(
  appointments: Appointment[],
  today: string = getTodayDateString(),
  limit = 7
): Appointment[] {
  const endDate = addDaysToDateString(today, 7);

  return appointments
    .filter(
      (appointment) =>
        appointment.status === "confirmed" &&
        appointment.appointmentDate >= today &&
        appointment.appointmentDate <= endDate
    )
    .sort(sortAppointmentsByDateAndTime)
    .slice(0, limit);
}

/** Non-cancelled appointments scheduled for today. */
export function getTodayAppointmentsCount(
  appointments: Appointment[],
  today: string = getTodayDateString()
): number {
  return appointments.filter(
    (appointment) =>
      appointment.appointmentDate === today &&
      appointment.status !== "cancelled"
  ).length;
}

/** Non-cancelled appointments from today through seven days ahead. */
export function getWeekAppointmentsCount(
  appointments: Appointment[],
  today: string = getTodayDateString()
): number {
  const endDate = addDaysToDateString(today, 7);

  return appointments.filter(
    (appointment) =>
      appointment.appointmentDate >= today &&
      appointment.appointmentDate <= endDate &&
      appointment.status !== "cancelled"
  ).length;
}

export type PopularServiceResult = {
  serviceId: string;
  count: number;
} | null;

/** Service with the highest appointment count. Ties broken by first seen. */
export function getMostPopularService(
  appointments: Appointment[]
): PopularServiceResult {
  const counts = new Map<string, number>();

  for (const appointment of appointments) {
    if (appointment.status === "cancelled") {
      continue;
    }

    counts.set(
      appointment.serviceId,
      (counts.get(appointment.serviceId) ?? 0) + 1
    );
  }

  let top: PopularServiceResult = null;

  for (const [serviceId, count] of counts) {
    if (!top || count > top.count) {
      top = { serviceId, count };
    }
  }

  return top;
}

/** Average rating from visible reviews, rounded to one decimal. */
export function getAverageReviewRating(
  reviews: CustomerReview[],
  options: { visibleOnly?: boolean } = {}
): number | null {
  const visibleOnly = options.visibleOnly ?? true;
  const eligible = visibleOnly
    ? reviews.filter((review) => review.isVisible)
    : reviews;

  if (eligible.length === 0) {
    return null;
  }

  const total = eligible.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / eligible.length) * 10) / 10;
}

/** Cancelled appointments as a percentage of all appointments (0–100). */
export function getCancellationRatePercent(
  appointments: Appointment[]
): number {
  if (appointments.length === 0) {
    return 0;
  }

  const cancelled = appointments.filter(
    (appointment) => appointment.status === "cancelled"
  ).length;

  return Math.round((cancelled / appointments.length) * 1000) / 10;
}
