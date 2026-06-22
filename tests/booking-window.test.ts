import { describe, expect, it } from "vitest";
import {
  addDaysToDateString,
  DEFAULT_BOOKING_WINDOW_DAYS,
  getBookingWindowMaxDate,
  isDateWithinBookingWindow,
  normalizeBookingWindowDays,
  resolveBookingWindowDays,
} from "@/lib/booking-window";

describe("normalizeBookingWindowDays", () => {
  it("returns default for invalid values", () => {
    expect(normalizeBookingWindowDays(undefined)).toBe(
      DEFAULT_BOOKING_WINDOW_DAYS
    );
    expect(normalizeBookingWindowDays("30")).toBe(DEFAULT_BOOKING_WINDOW_DAYS);
    expect(normalizeBookingWindowDays(Number.NaN)).toBe(
      DEFAULT_BOOKING_WINDOW_DAYS
    );
  });

  it("clamps values to the allowed range", () => {
    expect(normalizeBookingWindowDays(0)).toBe(1);
    expect(normalizeBookingWindowDays(500)).toBe(365);
    expect(normalizeBookingWindowDays(45.8)).toBe(46);
  });
});

describe("resolveBookingWindowDays", () => {
  it("falls back to default when settings are missing", () => {
    expect(resolveBookingWindowDays()).toBe(DEFAULT_BOOKING_WINDOW_DAYS);
    expect(resolveBookingWindowDays({})).toBe(DEFAULT_BOOKING_WINDOW_DAYS);
  });

  it("uses normalized settings value", () => {
    expect(resolveBookingWindowDays({ bookingWindowDays: 14 })).toBe(14);
  });
});

describe("booking window date helpers", () => {
  const today = "2026-06-22";

  it("adds days to a date string", () => {
    expect(addDaysToDateString(today, 7)).toBe("2026-06-29");
  });

  it("calculates the max booking date", () => {
    expect(getBookingWindowMaxDate(today, 30)).toBe("2026-07-22");
  });

  it("accepts dates within the booking window", () => {
    expect(isDateWithinBookingWindow(today, today, 30)).toBe(true);
    expect(isDateWithinBookingWindow("2026-07-22", today, 30)).toBe(true);
  });

  it("rejects dates before today or beyond the window", () => {
    expect(isDateWithinBookingWindow("2026-06-21", today, 30)).toBe(false);
    expect(isDateWithinBookingWindow("2026-07-23", today, 30)).toBe(false);
  });
});
