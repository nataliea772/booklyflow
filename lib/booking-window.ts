import type { BusinessSettings } from "./types";

export const DEFAULT_BOOKING_WINDOW_DAYS = 30;
export const MIN_BOOKING_WINDOW_DAYS = 1;
export const MAX_BOOKING_WINDOW_DAYS = 365;

export function normalizeBookingWindowDays(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_BOOKING_WINDOW_DAYS;
  }

  return Math.min(
    MAX_BOOKING_WINDOW_DAYS,
    Math.max(MIN_BOOKING_WINDOW_DAYS, Math.round(value))
  );
}

export function resolveBookingWindowDays(
  settings?: Pick<BusinessSettings, "bookingWindowDays">
): number {
  return normalizeBookingWindowDays(
    settings?.bookingWindowDays ?? DEFAULT_BOOKING_WINDOW_DAYS
  );
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function getBookingWindowMaxDate(
  today: string,
  bookingWindowDays: number
): string {
  return addDaysToDateString(today, bookingWindowDays);
}

export function isDateWithinBookingWindow(
  appointmentDate: string,
  today: string,
  bookingWindowDays: number
): boolean {
  if (!appointmentDate || appointmentDate < today) {
    return false;
  }

  return appointmentDate <= getBookingWindowMaxDate(today, bookingWindowDays);
}

export function clampBookingWindowDaysInput(value: number): number {
  return normalizeBookingWindowDays(value);
}
