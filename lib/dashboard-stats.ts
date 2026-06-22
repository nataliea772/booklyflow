import type { Appointment } from "./types";

export type ServicePriceLookup = (serviceId: string) => number;

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
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

export function getUpcomingAppointments(
  appointments: Appointment[],
  today: string,
  limit = 5,
  now: Date = new Date()
): Appointment[] {
  return appointments
    .filter((appointment) => isUpcomingAppointment(appointment, today, now))
    .sort((a, b) => {
      const dateCompare = a.appointmentDate.localeCompare(b.appointmentDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, limit);
}
