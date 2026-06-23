import { describe, expect, it } from "vitest";
import {
  formatCalendarMonthTitle,
  generateMonthDays,
  getMonthKeyForDate,
  isAfterMaxDate,
  isBeforeMinDate,
  isCalendarDateDisabled,
  canNavigateCalendarMonth,
} from "@/lib/booking-calendar";

describe("generateMonthDays", () => {
  it("includes padding and all days for a month", () => {
    const days = generateMonthDays(2026, 6);
    const validDays = days.filter((day): day is string => day !== null);

    expect(validDays).toHaveLength(30);
    expect(validDays[0]).toBe("2026-06-01");
    expect(validDays.at(-1)).toBe("2026-06-30");
    expect(days[0]).toBeNull();
  });
});

describe("date bounds", () => {
  it("disables dates before min date", () => {
    expect(isBeforeMinDate("2026-06-21", "2026-06-22")).toBe(true);
    expect(
      isCalendarDateDisabled("2026-06-21", {
        minDate: "2026-06-22",
        maxDate: "2026-07-22",
      })
    ).toBe(true);
  });

  it("disables dates after max date", () => {
    expect(isAfterMaxDate("2026-07-23", "2026-07-22")).toBe(true);
    expect(
      isCalendarDateDisabled("2026-07-23", {
        minDate: "2026-06-22",
        maxDate: "2026-07-22",
      })
    ).toBe(true);
  });

  it("allows dates inside the booking window", () => {
    expect(
      isCalendarDateDisabled("2026-06-25", {
        minDate: "2026-06-22",
        maxDate: "2026-07-22",
      })
    ).toBe(false);
  });

  it("respects custom disabled callback", () => {
    expect(
      isCalendarDateDisabled("2026-06-25", {
        minDate: "2026-06-22",
        maxDate: "2026-07-22",
        isDateDisabled: (date) => date === "2026-06-25",
      })
    ).toBe(true);
  });
});

describe("formatCalendarMonthTitle", () => {
  it("formats Hebrew month and year", () => {
    expect(formatCalendarMonthTitle(2026, 6)).toBe("יוני 2026");
  });
});

describe("getMonthKeyForDate", () => {
  it("returns YYYY-MM key", () => {
    expect(getMonthKeyForDate("2026-06-22")).toBe("2026-06");
  });
});

describe("canNavigateCalendarMonth", () => {
  it("blocks previous month when entirely before min date", () => {
    expect(
      canNavigateCalendarMonth(
        { year: 2026, month: 6 },
        -1,
        "2026-06-15",
        "2026-07-15"
      )
    ).toBe(false);
  });

  it("allows next month when range overlaps max date", () => {
    expect(
      canNavigateCalendarMonth(
        { year: 2026, month: 6 },
        1,
        "2026-06-01",
        "2026-07-15"
      )
    ).toBe(true);
  });
});
