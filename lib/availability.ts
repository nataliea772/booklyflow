import type {
  Appointment,
  BlockedTime,
  BusinessSettings,
  GetAvailableSlotsParams,
  Service,
  TimeSlot,
} from "./types";
import {
  getBlockedTimesForDate,
  isDateFullyBlocked,
} from "./blocked-times";
import {
  getWorkingHoursForDate,
  normalizeBusinessSettings,
} from "./working-hours";

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

export { isDateFullyBlocked, getBlockedTimesForDate } from "./blocked-times";

export function isWorkingDay(
  date: string,
  businessSettings: BusinessSettings
): boolean {
  const dayHours = getWorkingHoursForDate(date, businessSettings);
  return Boolean(dayHours?.isOpen);
}

function getAppointmentBlockedRanges(
  selectedDate: string,
  appointments: Appointment[],
  bufferMinutes: number,
  excludeAppointmentId?: string
): Array<{ startTime: string; endTime: string }> {
  return appointments
    .filter(
      (appointment) =>
        appointment.id !== excludeAppointmentId &&
        appointment.appointmentDate === selectedDate &&
        (appointment.status === "confirmed" || appointment.status === "pending")
    )
    .map((appointment) => ({
      startTime: appointment.startTime,
      endTime: minutesToTime(
        timeToMinutes(appointment.endTime) + bufferMinutes
      ),
    }));
}

function getManualBlockedRanges(
  selectedDate: string,
  blockedTimes: BlockedTime[]
): Array<{ startTime: string; endTime: string }> {
  return getBlockedTimesForDate(selectedDate, blockedTimes)
    .filter((blocked) => !blocked.isFullDay && blocked.startTime && blocked.endTime)
    .map((blocked) => ({
      startTime: blocked.startTime!,
      endTime: blocked.endTime!,
    }));
}

export function getAvailableSlots(
  params: GetAvailableSlotsParams
): TimeSlot[] {
  const {
    selectedDate,
    selectedService,
    appointments,
    businessSettings,
    blockedTimes = [],
    excludeAppointmentId,
  } = params;

  if (isDateFullyBlocked(selectedDate, blockedTimes)) {
    return [];
  }

  const dayHours = getWorkingHoursForDate(selectedDate, businessSettings);
  if (!dayHours?.isOpen) {
    return [];
  }

  const normalized = normalizeBusinessSettings(businessSettings);
  const businessStart = timeToMinutes(dayHours.startHour);
  const businessEnd = timeToMinutes(dayHours.endHour);
  const blockedRanges = [
    ...getAppointmentBlockedRanges(
      selectedDate,
      appointments,
      normalized.bufferMinutes,
      excludeAppointmentId
    ),
    ...getManualBlockedRanges(selectedDate, blockedTimes),
  ];
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

    if (slotEndMinutes > businessEnd) {
      continue;
    }

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
