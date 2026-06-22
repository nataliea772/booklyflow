import type { Appointment } from "./types";

export function hasScheduleChanged(
  original: Pick<Appointment, "serviceId" | "appointmentDate" | "startTime">,
  updated: Pick<Appointment, "serviceId" | "appointmentDate" | "startTime">
): boolean {
  return (
    original.serviceId !== updated.serviceId ||
    original.appointmentDate !== updated.appointmentDate ||
    original.startTime !== updated.startTime
  );
}
