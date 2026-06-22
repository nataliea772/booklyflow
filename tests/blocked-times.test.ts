import { describe, expect, it } from "vitest";
import {
  getBlockedTimesForDate,
  isDateFullyBlocked,
  isDateInBlockedRange,
  validateBlockedTimeInput,
} from "@/lib/blocked-times";
import type { BlockedTime } from "@/lib/types";

const vacationBlock: BlockedTime = {
  id: "vacation",
  startDate: "2026-07-01",
  endDate: "2026-07-05",
  isFullDay: true,
  reason: "חופשה",
  createdAt: "2026-07-01T08:00:00.000Z",
};

describe("isDateInBlockedRange", () => {
  it("includes start and end dates", () => {
    expect(isDateInBlockedRange("2026-07-01", vacationBlock)).toBe(true);
    expect(isDateInBlockedRange("2026-07-05", vacationBlock)).toBe(true);
    expect(isDateInBlockedRange("2026-07-03", vacationBlock)).toBe(true);
  });

  it("excludes dates before and after the range", () => {
    expect(isDateInBlockedRange("2026-06-30", vacationBlock)).toBe(false);
    expect(isDateInBlockedRange("2026-07-06", vacationBlock)).toBe(false);
  });
});

describe("isDateFullyBlocked", () => {
  it("blocks every date inside a full-day range", () => {
    expect(isDateFullyBlocked("2026-07-02", [vacationBlock])).toBe(true);
  });

  it("does not block dates outside the range", () => {
    expect(isDateFullyBlocked("2026-06-30", [vacationBlock])).toBe(false);
  });
});

describe("getBlockedTimesForDate", () => {
  it("returns blocks that apply to the selected date", () => {
    const partialBlock: BlockedTime = {
      id: "partial",
      startDate: "2026-07-06",
      endDate: "2026-07-08",
      isFullDay: false,
      startTime: "12:00",
      endTime: "16:00",
      createdAt: "2026-07-06T08:00:00.000Z",
    };

    expect(getBlockedTimesForDate("2026-07-07", [vacationBlock, partialBlock])).toEqual([
      partialBlock,
    ]);
  });
});

describe("validateBlockedTimeInput", () => {
  it("rejects end dates before start dates", () => {
    const result = validateBlockedTimeInput({
      startDate: "2026-07-10",
      endDate: "2026-07-08",
      isFullDay: true,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.message).toContain("תאריך הסיום");
    }
  });

  it("requires times for partial blocks", () => {
    const result = validateBlockedTimeInput({
      startDate: "2026-07-10",
      endDate: "2026-07-10",
      isFullDay: false,
    });

    expect(result.valid).toBe(false);
  });

  it("accepts valid full-day ranges", () => {
    expect(
      validateBlockedTimeInput({
        startDate: "2026-07-01",
        endDate: "2026-07-05",
        isFullDay: true,
      }).valid
    ).toBe(true);
  });
});
