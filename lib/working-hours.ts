import { normalizeBookingWindowDays } from "@/lib/booking-window";
import type { BusinessSettings, BusinessWorkingDay } from "@/lib/types";

const DEFAULT_WORKING_DAYS = [0, 1, 2, 3, 4];
const DEFAULT_START_HOUR = "09:00";
const DEFAULT_END_HOUR = "18:00";

export function createDefaultWorkingHours(): BusinessWorkingDay[] {
  return [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    dayOfWeek,
    isOpen: DEFAULT_WORKING_DAYS.includes(dayOfWeek),
    startHour: DEFAULT_START_HOUR,
    endHour: DEFAULT_END_HOUR,
  }));
}

export function workingHoursFromLegacy(
  workingDays: number[],
  startHour: string,
  endHour: string
): BusinessWorkingDay[] {
  return [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    dayOfWeek,
    isOpen: workingDays.includes(dayOfWeek),
    startHour,
    endHour,
  }));
}

export function parseWorkingHoursJson(
  value: unknown
): BusinessWorkingDay[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const parsed: BusinessWorkingDay[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const row = item as Record<string, unknown>;
    const dayOfWeek = row.dayOfWeek ?? row.day_of_week;
    const isOpen = row.isOpen ?? row.is_open;
    const startHour = row.startHour ?? row.start_hour;
    const endHour = row.endHour ?? row.end_hour;

    if (
      typeof dayOfWeek !== "number" ||
      dayOfWeek < 0 ||
      dayOfWeek > 6 ||
      typeof isOpen !== "boolean" ||
      typeof startHour !== "string" ||
      typeof endHour !== "string"
    ) {
      continue;
    }

    parsed.push({
      dayOfWeek,
      isOpen,
      startHour,
      endHour,
    });
  }

  if (parsed.length === 0) {
    return null;
  }

  const byDay = new Map(parsed.map((day) => [day.dayOfWeek, day]));
  return [0, 1, 2, 3, 4, 5, 6].map(
    (dayOfWeek) =>
      byDay.get(dayOfWeek) ?? {
        dayOfWeek,
        isOpen: false,
        startHour: DEFAULT_START_HOUR,
        endHour: DEFAULT_END_HOUR,
      }
  );
}

export function deriveLegacyFromWorkingHours(
  workingHours: BusinessWorkingDay[]
): Pick<BusinessSettings, "workingDays" | "startHour" | "endHour"> {
  const openDays = workingHours.filter((day) => day.isOpen);
  const firstOpen = openDays[0];

  return {
    workingDays: openDays.map((day) => day.dayOfWeek).sort((a, b) => a - b),
    startHour: firstOpen?.startHour ?? DEFAULT_START_HOUR,
    endHour: firstOpen?.endHour ?? DEFAULT_END_HOUR,
  };
}

export function normalizeBusinessSettings(
  settings: BusinessSettings
): BusinessSettings {
  const workingHours =
    settings.workingHours?.length === 7
      ? settings.workingHours
      : workingHoursFromLegacy(
          settings.workingDays,
          settings.startHour,
          settings.endHour
        );

  const legacy = deriveLegacyFromWorkingHours(workingHours);

  return {
    ...settings,
    workingHours,
    bookingWindowDays: normalizeBookingWindowDays(settings.bookingWindowDays),
    workingDays: legacy.workingDays,
    startHour: legacy.startHour,
    endHour: legacy.endHour,
  };
}

export function getDayOfWeekFromDate(date: string): number {
  return new Date(`${date}T12:00:00`).getDay();
}

export function getWorkingHoursForDate(
  date: string,
  businessSettings: BusinessSettings
): BusinessWorkingDay | null {
  const normalized = normalizeBusinessSettings(businessSettings);
  const dayOfWeek = getDayOfWeekFromDate(date);
  return (
    normalized.workingHours.find((day) => day.dayOfWeek === dayOfWeek) ?? null
  );
}
