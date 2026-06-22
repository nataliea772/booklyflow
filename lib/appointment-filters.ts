import { addDaysToDateString } from "@/lib/booking-window";
import type { Appointment, AppointmentStatus } from "@/lib/types";

export type AppointmentStatusFilter = AppointmentStatus | "all";

export type AppointmentQuickFilter = "all" | "today" | "tomorrow" | "week";

export type AppointmentFilters = {
  searchQuery: string;
  status: AppointmentStatusFilter;
  date: string;
};

export function filterAppointments(
  appointments: Appointment[],
  filters: AppointmentFilters
): Appointment[] {
  const query = filters.searchQuery.trim().toLowerCase();
  const phoneDigits = query.replace(/\D/g, "");

  return appointments.filter((appointment) => {
    if (filters.status !== "all" && appointment.status !== filters.status) {
      return false;
    }

    if (filters.date && appointment.appointmentDate !== filters.date) {
      return false;
    }

    if (!query) {
      return true;
    }

    const nameMatch = appointment.customerName.toLowerCase().includes(query);
    const phoneMatch =
      appointment.customerPhone.toLowerCase().includes(query) ||
      (phoneDigits.length > 0 &&
        appointment.customerPhone.replace(/\D/g, "").includes(phoneDigits));

    return nameMatch || phoneMatch;
  });
}

export function applyQuickDateFilter(
  appointments: Appointment[],
  quickFilter: AppointmentQuickFilter,
  today: string
): Appointment[] {
  if (quickFilter === "all") {
    return appointments;
  }

  if (quickFilter === "today") {
    return appointments.filter(
      (appointment) => appointment.appointmentDate === today
    );
  }

  if (quickFilter === "tomorrow") {
    const tomorrow = addDaysToDateString(today, 1);
    return appointments.filter(
      (appointment) => appointment.appointmentDate === tomorrow
    );
  }

  const weekEnd = addDaysToDateString(today, 7);
  return appointments.filter(
    (appointment) =>
      appointment.appointmentDate >= today &&
      appointment.appointmentDate <= weekEnd
  );
}

export function filterAppointmentsWithQuickRange(
  appointments: Appointment[],
  filters: AppointmentFilters,
  quickFilter: AppointmentQuickFilter,
  today: string
): Appointment[] {
  const filtered = filterAppointments(appointments, filters);
  return applyQuickDateFilter(filtered, quickFilter, today);
}
