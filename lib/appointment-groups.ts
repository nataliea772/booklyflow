import { formatDisplayDate } from "@/lib/i18n";
import type { Appointment } from "@/lib/types";

export type AppointmentDayGroup = {
  date: string;
  label: string;
  appointments: Appointment[];
};

export function sortAppointmentsByDateTime(
  appointments: Appointment[]
): Appointment[] {
  return [...appointments].sort((a, b) => {
    const dateCompare = a.appointmentDate.localeCompare(b.appointmentDate);
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return a.startTime.localeCompare(b.startTime);
  });
}

export function groupAppointmentsByDay(
  appointments: Appointment[]
): AppointmentDayGroup[] {
  const sorted = sortAppointmentsByDateTime(appointments);
  const groups = new Map<string, Appointment[]>();

  for (const appointment of sorted) {
    const existing = groups.get(appointment.appointmentDate) ?? [];
    existing.push(appointment);
    groups.set(appointment.appointmentDate, existing);
  }

  return Array.from(groups.entries()).map(([date, dayAppointments]) => ({
    date,
    label: formatDisplayDate(date),
    appointments: dayAppointments,
  }));
}

export function isAppointmentUpcomingOrToday(
  appointment: Appointment,
  today: string
): boolean {
  if (
    appointment.status === "cancelled" ||
    appointment.status === "completed"
  ) {
    return false;
  }

  return appointment.appointmentDate >= today;
}
