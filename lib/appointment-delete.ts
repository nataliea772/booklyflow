import type { AppointmentStatus } from "@/lib/types";

/** Only cancelled or completed appointments may be deleted from admin. */
export function canDeleteAppointment(status: AppointmentStatus): boolean {
  return status === "cancelled" || status === "completed";
}
