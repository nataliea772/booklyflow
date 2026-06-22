import type { Appointment, AppointmentStatus } from "@/lib/types";

export type AppointmentStatusFilter = AppointmentStatus | "all";

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
