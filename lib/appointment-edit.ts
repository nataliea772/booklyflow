import {
  calculateEndTime,
  getAvailableSlots,
  isDateFullyBlocked,
  isWorkingDay,
  timeToMinutes,
} from "./availability";
import {
  getDayOfWeekFromDate,
  getWorkingHoursForDate,
  normalizeBusinessSettings,
} from "./working-hours";
import type {
  Appointment,
  AppointmentStatus,
  BlockedTime,
  BusinessSettings,
  Service,
} from "./types";

export const HEBREW_WEEKDAYS: { value: number; label: string }[] = [
  { value: 0, label: "ראשון" },
  { value: 1, label: "שני" },
  { value: 2, label: "שלישי" },
  { value: 3, label: "רביעי" },
  { value: 4, label: "חמישי" },
  { value: 5, label: "שישי" },
  { value: 6, label: "שבת" },
];

export function formatWorkingDaysLabels(workingDays: number[]): string {
  const sorted = [...workingDays].sort((a, b) => a - b);
  return sorted
    .map(
      (day) => HEBREW_WEEKDAYS.find((item) => item.value === day)?.label ?? ""
    )
    .filter(Boolean)
    .join(" · ");
}

export function formatBookingHoursHint(
  settings: BusinessSettings,
  selectedDate?: string
): string {
  const normalized = normalizeBusinessSettings(settings);

  if (selectedDate) {
    const dayHours = getWorkingHoursForDate(selectedDate, settings);
    const dayName =
      HEBREW_WEEKDAYS.find(
        (item) => item.value === getDayOfWeekFromDate(selectedDate)
      )?.label ?? "";

    if (!dayHours?.isOpen) {
      return `${dayName}: סגור`;
    }

    return `${dayName}: ${dayHours.startHour} – ${dayHours.endHour}`;
  }

  return `${formatWorkingDaysLabels(normalized.workingDays)} · שעות משתנות לפי יום`;
}

export function isAppointmentPast(
  appointment: Pick<Appointment, "appointmentDate" | "endTime">,
  today: string,
  now: Date = new Date()
): boolean {
  if (appointment.appointmentDate < today) {
    return true;
  }

  if (appointment.appointmentDate > today) {
    return false;
  }

  return timeToMinutes(appointment.endTime) < now.getHours() * 60 + now.getMinutes();
}

export type ValidateAppointmentSlotParams = {
  service: Service;
  appointmentDate: string;
  startTime: string;
  appointments: Appointment[];
  businessSettings: BusinessSettings;
  blockedTimes?: BlockedTime[];
  excludeAppointmentId?: string;
  status: AppointmentStatus;
};

export type ValidateAppointmentSlotResult =
  | { valid: true; endTime: string }
  | { valid: false; message: string };

export function validateAppointmentSlot(
  params: ValidateAppointmentSlotParams
): ValidateAppointmentSlotResult {
  const {
    service,
    appointmentDate,
    startTime,
    appointments,
    businessSettings,
    excludeAppointmentId,
    status,
    blockedTimes = [],
  } = params;

  if (!isWorkingDay(appointmentDate, businessSettings)) {
    return { valid: false, message: "העסק אינו פעיל ביום זה." };
  }

  if (isDateFullyBlocked(appointmentDate, blockedTimes)) {
    return { valid: false, message: "התאריך שנבחר אינו זמין להזמנות." };
  }

  const endTime = calculateEndTime(startTime, service.durationMinutes);

  if (status === "cancelled" || status === "completed") {
    return { valid: true, endTime };
  }

  const slots = getAvailableSlots({
    selectedDate: appointmentDate,
    selectedService: service,
    appointments,
    businessSettings,
    blockedTimes,
    excludeAppointmentId,
  });

  const isAvailable = slots.some((slot) => slot.startTime === startTime);

  if (!isAvailable) {
    return {
      valid: false,
      message: "השעה שנבחרה אינה זמינה או חופפת לתור אחר.",
    };
  }

  return { valid: true, endTime };
}
