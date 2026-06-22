import type {
  Appointment,
  BusinessSettings,
  GetAvailableSlotsParams,
  Service,
  TimeSlot,
} from "./types";

const SLOT_INTERVAL_MINUTES = 30;

/** Converts "HH:MM" (24h) or "H:MM AM/PM" into minutes from midnight. */
export function timeToMinutes(time: string): number {
  const trimmed = time.trim();

  const twelveHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    let hours = parseInt(twelveHourMatch[1], 10);
    const minutes = parseInt(twelveHourMatch[2], 10);
    const period = twelveHourMatch[3].toUpperCase();

    if (period === "AM" && hours === 12) hours = 0;
    if (period === "PM" && hours !== 12) hours += 12;

    return hours * 60 + minutes;
  }

  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHourMatch) {
    const hours = parseInt(twentyFourHourMatch[1], 10);
    const minutes = parseInt(twentyFourHourMatch[2], 10);
    return hours * 60 + minutes;
  }

  throw new Error(`Invalid time format: "${time}"`);
}

/** Converts minutes from midnight into "HH:MM" (24h). */
export function minutesToTime(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/** Human-readable label for UI display (24-hour format). */
export function formatTimeLabel(time: string): string {
  const minutes = timeToMinutes(time);
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours24.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function calculateEndTime(
  startTime: string,
  durationMinutes: number
): string {
  return minutesToTime(timeToMinutes(startTime) + durationMinutes);
}

/** Returns true when two half-open ranges [start, end) overlap. */
export function doTimeRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const startMinutesA = timeToMinutes(startA);
  const endMinutesA = timeToMinutes(endA);
  const startMinutesB = timeToMinutes(startB);
  const endMinutesB = timeToMinutes(endB);

  return startMinutesA < endMinutesB && startMinutesB < endMinutesA;
}

export function isWorkingDay(
  date: string,
  businessSettings: BusinessSettings
): boolean {
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
  return businessSettings.workingDays.includes(dayOfWeek);
}

/**
 * Builds blocked ranges for pending/confirmed appointments on the selected date.
 * Each blocked range spans from appointment start through end + buffer.
 */
function getBlockedRanges(
  selectedDate: string,
  appointments: Appointment[],
  businessSettings: BusinessSettings
): Array<{ startTime: string; endTime: string }> {
  return appointments
    .filter(
      (appointment) =>
        appointment.appointmentDate === selectedDate &&
        (appointment.status === "confirmed" || appointment.status === "pending")
    )
    .map((appointment) => ({
      startTime: appointment.startTime,
      endTime: minutesToTime(
        timeToMinutes(appointment.endTime) + businessSettings.bufferMinutes
      ),
    }));
}

export function getAvailableSlots(
  params: GetAvailableSlotsParams
): TimeSlot[] {
  const { selectedDate, selectedService, appointments, businessSettings } =
    params;

  if (!isWorkingDay(selectedDate, businessSettings)) {
    return [];
  }

  const businessStart = timeToMinutes(businessSettings.startHour);
  const businessEnd = timeToMinutes(businessSettings.endHour);
  const blockedRanges = getBlockedRanges(
    selectedDate,
    appointments,
    businessSettings
  );
  const availableSlots: TimeSlot[] = [];

  for (
    let slotStartMinutes = businessStart;
    slotStartMinutes < businessEnd;
    slotStartMinutes += SLOT_INTERVAL_MINUTES
  ) {
    const slotStartTime = minutesToTime(slotStartMinutes);
    const slotEndTime = calculateEndTime(
      slotStartTime,
      selectedService.durationMinutes
    );
    const slotEndMinutes = timeToMinutes(slotEndTime);

    // Slot must fully fit before the business closes.
    if (slotEndMinutes > businessEnd) {
      continue;
    }

    // Skip slots that overlap any blocked appointment window.
    const hasOverlap = blockedRanges.some((blocked) =>
      doTimeRangesOverlap(
        slotStartTime,
        slotEndTime,
        blocked.startTime,
        blocked.endTime
      )
    );

    if (!hasOverlap) {
      availableSlots.push({
        startTime: slotStartTime,
        endTime: slotEndTime,
        isAvailable: true,
      });
    }
  }

  return availableSlots;
}

export function findService(
  services: Service[],
  serviceId: string
): Service | undefined {
  return services.find(
    (service) => service.id === serviceId && service.isActive
  );
}

export function getServiceName(
  services: Service[],
  serviceId: string
): string {
  return services.find((service) => service.id === serviceId)?.name ?? "Unknown";
}
