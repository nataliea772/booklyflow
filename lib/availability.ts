import type {
  Appointment,
  AppointmentStatus,
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
import { getLocalDateString } from "./dates";

export const DEFAULT_SLOT_INTERVAL_MINUTES = 30;

/** Normalizes "HH:MM", "HH:MM:SS", or 12-hour strings for parsing. */
export function normalizeTimeString(time: string): string {
  const trimmed = time.trim();
  const withSeconds = trimmed.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (withSeconds) {
    return `${withSeconds[1].padStart(2, "0")}:${withSeconds[2]}`;
  }

  return trimmed;
}

/** Converts "HH:MM" (24h) or "H:MM AM/PM" into minutes from midnight. */
export function timeToMinutes(time: string): number {
  const trimmed = normalizeTimeString(time);

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

/** Appointments that occupy time on the schedule for availability purposes. */
export function isBlockingAppointmentStatus(
  status: AppointmentStatus
): boolean {
  return (
    status === "pending" ||
    status === "confirmed" ||
    status === "completed"
  );
}

/**
 * Buffer rule: every appointment keeps bufferMinutes clear before and after.
 * The candidate slot is expanded by buffer on both sides, then checked against
 * the raw appointment interval [appointmentStart, appointmentEnd).
 *
 * Example — existing 10:00–11:00, buffer 15, candidate 09:30–10:00:
 *   buffered candidate 09:15–10:15 overlaps 10:00–11:00 → blocked.
 * Example — candidate 09:15–09:45:
 *   buffered 09:00–10:00 does not overlap 10:00–11:00 → allowed.
 */
export function doesSlotConflictWithBufferedAppointment(
  candidateStart: string,
  candidateEnd: string,
  appointmentStart: string,
  appointmentEnd: string,
  bufferMinutes: number
): boolean {
  if (bufferMinutes <= 0) {
    return doTimeRangesOverlap(
      candidateStart,
      candidateEnd,
      appointmentStart,
      appointmentEnd
    );
  }

  const candidateStartBuffered = minutesToTime(
    timeToMinutes(candidateStart) - bufferMinutes
  );
  const candidateEndBuffered = minutesToTime(
    timeToMinutes(candidateEnd) + bufferMinutes
  );

  return (
    timeToMinutes(candidateStartBuffered) < timeToMinutes(appointmentEnd) &&
    timeToMinutes(candidateEndBuffered) > timeToMinutes(appointmentStart)
  );
}

function getBlockingAppointmentsForDate(
  selectedDate: string,
  appointments: Appointment[],
  excludeAppointmentId?: string
): Appointment[] {
  return appointments
    .filter(
      (appointment) =>
        appointment.id !== excludeAppointmentId &&
        appointment.appointmentDate === selectedDate &&
        isBlockingAppointmentStatus(appointment.status)
    )
    .map((appointment) => ({
      ...appointment,
      startTime: normalizeTimeString(appointment.startTime),
      endTime: normalizeTimeString(appointment.endTime),
    }));
}

function getManualBlockedRanges(
  selectedDate: string,
  blockedTimes: BlockedTime[]
): Array<{ startTime: string; endTime: string }> {
  return getBlockedTimesForDate(selectedDate, blockedTimes)
    .filter((blocked) => !blocked.isFullDay && blocked.startTime && blocked.endTime)
    .map((blocked) => ({
      startTime: normalizeTimeString(blocked.startTime!),
      endTime: normalizeTimeString(blocked.endTime!),
    }));
}

/**
 * When booking today, customers cannot pick a slot that already started.
 * Returns the next grid-aligned start time at or after now.
 */
export function getEarliestBookableSlotStart(
  selectedDate: string,
  slotIntervalMinutes: number = DEFAULT_SLOT_INTERVAL_MINUTES,
  now: Date = new Date()
): string | undefined {
  const today = getLocalDateString(now);
  if (selectedDate !== today) {
    return undefined;
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const interval = Math.max(1, slotIntervalMinutes);
  const alignedStart = Math.ceil(nowMinutes / interval) * interval;

  if (alignedStart >= 24 * 60) {
    return undefined;
  }

  return minutesToTime(alignedStart);
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
    slotIntervalMinutes = DEFAULT_SLOT_INTERVAL_MINUTES,
    minSlotStartTime,
  } = params;

  if (isDateFullyBlocked(selectedDate, blockedTimes)) {
    return [];
  }

  const dayHours = getWorkingHoursForDate(selectedDate, businessSettings);
  if (!dayHours?.isOpen) {
    return [];
  }

  const normalized = normalizeBusinessSettings(businessSettings);
  const bufferMinutes = normalized.bufferMinutes ?? 0;
  const businessStart = timeToMinutes(normalizeTimeString(dayHours.startHour));
  const businessEnd = timeToMinutes(normalizeTimeString(dayHours.endHour));
  const earliestSlotStartMinutes = minSlotStartTime
    ? timeToMinutes(minSlotStartTime)
    : businessStart;
  const slotLoopStart = Math.max(businessStart, earliestSlotStartMinutes);
  const blockingAppointments = getBlockingAppointmentsForDate(
    selectedDate,
    appointments,
    excludeAppointmentId
  );
  const manualBlockedRanges = getManualBlockedRanges(selectedDate, blockedTimes);
  const availableSlots: TimeSlot[] = [];

  for (
    let slotStartMinutes = slotLoopStart;
    slotStartMinutes < businessEnd;
    slotStartMinutes += slotIntervalMinutes
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

    const conflictsWithAppointment = blockingAppointments.some((appointment) =>
      doesSlotConflictWithBufferedAppointment(
        slotStartTime,
        slotEndTime,
        appointment.startTime,
        appointment.endTime,
        bufferMinutes
      )
    );

    const conflictsWithManualBlock = manualBlockedRanges.some((blocked) =>
      doTimeRangesOverlap(
        slotStartTime,
        slotEndTime,
        blocked.startTime,
        blocked.endTime
      )
    );

    if (!conflictsWithAppointment && !conflictsWithManualBlock) {
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
