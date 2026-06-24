import { describe, expect, it } from "vitest";
import {
  calculateEndTime,
  DEFAULT_SLOT_INTERVAL_MINUTES,
  doTimeRangesOverlap,
  doesSlotConflictWithBufferedAppointment,
  getAvailableSlots,
  isBlockingAppointmentStatus,
  isDateFullyBlocked,
  minutesToTime,
  timeToMinutes,
} from "@/lib/availability";
import type {
  Appointment,
  BlockedTime,
  BusinessSettings,
  Service,
} from "@/lib/types";
import { workingHoursFromLegacy } from "@/lib/working-hours";

const TEST_DATE = "2026-06-22";
const SUNDAY_DATE = "2026-06-21";
const CLOSED_DATE = "2026-06-26";

const businessSettings: BusinessSettings = {
  businessName: "BooklyFlow Studio",
  startHour: "09:00",
  endHour: "18:00",
  bufferMinutes: 15,
  workingDays: [0, 1, 2, 3, 4],
  workingHours: workingHoursFromLegacy([0, 1, 2, 3, 4], "09:00", "18:00"),
};

const perDaySettings: BusinessSettings = {
  ...businessSettings,
  workingHours: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    dayOfWeek,
    isOpen: dayOfWeek !== 6,
    startHour: dayOfWeek === 0 ? "08:00" : dayOfWeek === 1 ? "10:00" : "09:00",
    endHour: dayOfWeek === 0 ? "16:00" : "18:00",
  })),
  workingDays: [0, 1, 2, 3, 4, 5],
};

const service20: Service = {
  id: "consult",
  name: "Consultation",
  description: "Short consultation",
  price: 0,
  durationMinutes: 20,
  isActive: true,
};

const service30: Service = {
  id: "quick",
  name: "Quick Session",
  description: "30-minute session",
  price: 45,
  durationMinutes: 30,
  isActive: true,
};

const service60: Service = {
  id: "massage",
  name: "Deep Tissue Massage",
  description: "60-minute session",
  price: 85,
  durationMinutes: 60,
  isActive: true,
};

const service90: Service = {
  id: "color",
  name: "Color Treatment",
  description: "90-minute color session",
  price: 120,
  durationMinutes: 90,
  isActive: true,
};

function createAppointment(
  overrides: Partial<Appointment> &
    Pick<Appointment, "id" | "startTime" | "endTime" | "status">
): Appointment {
  return {
    serviceId: "1",
    customerName: "Test Customer",
    customerPhone: "(555) 000-0000",
    appointmentDate: TEST_DATE,
    createdAt: "2026-06-22T08:00:00.000Z",
    ...overrides,
  };
}

function slotStartTimes(slots: ReturnType<typeof getAvailableSlots>): string[] {
  return slots.map((slot) => slot.startTime);
}

describe("timeToMinutes", () => {
  it('converts "09:30" to 570', () => {
    expect(timeToMinutes("09:30")).toBe(570);
  });

  it("converts 12-hour times", () => {
    expect(timeToMinutes("1:00 PM")).toBe(780);
  });
});

describe("minutesToTime", () => {
  it('converts 570 to "09:30"', () => {
    expect(minutesToTime(570)).toBe("09:30");
  });
});

describe("calculateEndTime", () => {
  it('returns "10:30" for a 90-minute slot starting at 09:00', () => {
    expect(calculateEndTime("09:00", 90)).toBe("10:30");
  });
});

describe("doTimeRangesOverlap", () => {
  it("returns true for overlapping ranges", () => {
    expect(doTimeRangesOverlap("09:00", "10:00", "09:30", "10:30")).toBe(true);
  });

  it("returns false for touching ranges", () => {
    expect(doTimeRangesOverlap("10:00", "11:00", "11:00", "12:00")).toBe(false);
  });

  it("returns true when one range is fully inside another", () => {
    expect(doTimeRangesOverlap("09:00", "12:00", "10:00", "11:00")).toBe(true);
  });
});

describe("getAvailableSlots", () => {
  it("generates 30-minute interval slots between 09:00 and 18:00", () => {
    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service20,
      appointments: [],
      businessSettings,
    });

    expect(slotStartTimes(slots)).toEqual([
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
    ]);
  });

  it("does not return slots that cannot finish before closing time", () => {
    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service90,
      appointments: [],
      businessSettings,
    });

    expect(slotStartTimes(slots).at(-1)).toBe("16:30");
    expect(slotStartTimes(slots)).not.toContain("17:00");
  });

  it("blocks pending appointments", () => {
    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service60,
      appointments: [
        createAppointment({
          id: "pending-1",
          startTime: "10:00",
          endTime: "11:00",
          status: "pending",
        }),
      ],
      businessSettings,
    });

    expect(slotStartTimes(slots)).not.toContain("10:00");
    expect(slotStartTimes(slots)).not.toContain("10:30");
  });

  it("blocks confirmed appointments", () => {
    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service60,
      appointments: [
        createAppointment({
          id: "confirmed-1",
          startTime: "10:00",
          endTime: "11:00",
          status: "confirmed",
        }),
      ],
      businessSettings,
    });

    expect(slotStartTimes(slots)).not.toContain("10:00");
    expect(slotStartTimes(slots)).not.toContain("10:30");
  });

  it("does not block cancelled appointments", () => {
    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service60,
      appointments: [
        createAppointment({
          id: "cancelled-1",
          startTime: "10:00",
          endTime: "11:00",
          status: "cancelled",
        }),
      ],
      businessSettings,
    });

    expect(slotStartTimes(slots)).toContain("10:00");
    expect(slotStartTimes(slots)).toContain("10:30");
  });

  it("blocks completed appointments on the selected date", () => {
    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service60,
      appointments: [
        createAppointment({
          id: "completed-1",
          startTime: "10:00",
          endTime: "11:00",
          status: "completed",
        }),
      ],
      businessSettings,
    });

    expect(slotStartTimes(slots)).not.toContain("10:00");
    expect(slotStartTimes(slots)).not.toContain("10:30");
    expect(slotStartTimes(slots)).not.toContain("11:00");
    expect(slotStartTimes(slots)).toContain("11:30");
  });

  it("applies bufferMinutes after confirmed appointments", () => {
    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service60,
      appointments: [
        createAppointment({
          id: "confirmed-buffer",
          startTime: "10:00",
          endTime: "11:00",
          status: "confirmed",
        }),
      ],
      businessSettings,
    });

    expect(slotStartTimes(slots)).not.toContain("11:00");
    expect(slotStartTimes(slots)).toContain("11:30");
  });

  it("blocks candidate slots ending too close before an existing appointment", () => {
    const morningSettings: BusinessSettings = {
      ...businessSettings,
      startHour: "09:00",
      endHour: "12:00",
      bufferMinutes: 15,
      workingHours: workingHoursFromLegacy([0, 1, 2, 3, 4], "09:00", "12:00"),
    };

    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service30,
      appointments: [
        createAppointment({
          id: "confirmed-morning",
          startTime: "10:00",
          endTime: "11:00",
          status: "confirmed",
        }),
      ],
      businessSettings: morningSettings,
      slotIntervalMinutes: 15,
    });

    expect(slotStartTimes(slots)).not.toContain("09:30");
    expect(slotStartTimes(slots)).toContain("09:15");
    expect(slotStartTimes(slots)).not.toContain("11:00");
    expect(slotStartTimes(slots)).toContain("11:15");
  });

  it("respects different durations stored on existing appointments", () => {
    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service30,
      appointments: [
        createAppointment({
          id: "long-existing",
          startTime: "10:00",
          endTime: "11:30",
          status: "confirmed",
        }),
      ],
      businessSettings,
      slotIntervalMinutes: 15,
    });

    expect(slotStartTimes(slots)).not.toContain("09:45");
    expect(slotStartTimes(slots)).not.toContain("11:30");
    expect(slotStartTimes(slots)).toContain("11:45");
  });

  it("uses bufferMinutes from business settings", () => {
    const noBufferSettings: BusinessSettings = {
      ...businessSettings,
      bufferMinutes: 0,
    };

    const withBuffer = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service60,
      appointments: [
        createAppointment({
          id: "confirmed-no-gap",
          startTime: "10:00",
          endTime: "11:00",
          status: "confirmed",
        }),
      ],
      businessSettings,
    });

    const withoutBuffer = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service60,
      appointments: [
        createAppointment({
          id: "confirmed-no-gap",
          startTime: "10:00",
          endTime: "11:00",
          status: "confirmed",
        }),
      ],
      businessSettings: noBufferSettings,
    });

    expect(slotStartTimes(withBuffer)).not.toContain("11:00");
    expect(slotStartTimes(withoutBuffer)).toContain("11:00");
  });

  it("returns an empty array for non-working days", () => {
    const slots = getAvailableSlots({
      selectedDate: CLOSED_DATE,
      selectedService: service20,
      appointments: [],
      businessSettings,
    });

    expect(slots).toEqual([]);
  });

  it("prevents double booking for a 60-minute service", () => {
    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service60,
      appointments: [
        createAppointment({
          id: "existing-60",
          startTime: "14:00",
          endTime: "15:00",
          status: "confirmed",
        }),
      ],
      businessSettings,
    });

    expect(slotStartTimes(slots)).not.toContain("14:00");
    expect(slotStartTimes(slots)).not.toContain("13:30");
    expect(slotStartTimes(slots)).not.toContain("14:30");
    expect(slotStartTimes(slots)).toContain("15:30");
  });

  it("prevents partial overlap for a 90-minute service", () => {
    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service90,
      appointments: [
        createAppointment({
          id: "existing-90",
          startTime: "13:00",
          endTime: "14:30",
          status: "pending",
        }),
      ],
      businessSettings,
    });

    expect(slotStartTimes(slots)).not.toContain("12:00");
    expect(slotStartTimes(slots)).not.toContain("12:30");
    expect(slotStartTimes(slots)).not.toContain("13:00");
    expect(slotStartTimes(slots)).not.toContain("13:30");
    expect(slotStartTimes(slots)).not.toContain("14:00");
    expect(slotStartTimes(slots)).not.toContain("14:30");
    expect(slotStartTimes(slots)).toContain("15:00");
  });

  it("marks returned slots as available", () => {
    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service20,
      appointments: [],
      businessSettings,
    });

    expect(slots.every((slot) => slot.isAvailable)).toBe(true);
    expect(slots[0].endTime).toBe("09:20");
  });

  it("uses Sunday 08:00-16:00 hours when configured per day", () => {
    const slots = getAvailableSlots({
      selectedDate: SUNDAY_DATE,
      selectedService: service20,
      appointments: [],
      businessSettings: perDaySettings,
    });

    expect(slotStartTimes(slots)[0]).toBe("08:00");
    expect(slotStartTimes(slots).at(-1)).toBe("15:30");
    expect(slotStartTimes(slots)).not.toContain("16:00");
  });

  it("uses Monday 10:00-18:00 hours when configured per day", () => {
    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service20,
      appointments: [],
      businessSettings: perDaySettings,
    });

    expect(slotStartTimes(slots)[0]).toBe("10:00");
    expect(slotStartTimes(slots)).not.toContain("09:00");
    expect(slotStartTimes(slots).at(-1)).toBe("17:30");
  });

  it("returns no slots for a closed day in per-day schedule", () => {
    const slots = getAvailableSlots({
      selectedDate: "2026-06-27",
      selectedService: service20,
      appointments: [],
      businessSettings: perDaySettings,
    });

    expect(slots).toEqual([]);
  });

  it("returns no slots for a full-day blocked date", () => {
    const blockedTimes: BlockedTime[] = [
      {
        id: "block-full",
        startDate: TEST_DATE,
        endDate: TEST_DATE,
        isFullDay: true,
        createdAt: "2026-06-22T08:00:00.000Z",
      },
    ];

    expect(isDateFullyBlocked(TEST_DATE, blockedTimes)).toBe(true);

    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service20,
      appointments: [],
      businessSettings,
      blockedTimes,
    });

    expect(slots).toEqual([]);
  });

  it("removes slots overlapping a time-range block", () => {
    const blockedTimes: BlockedTime[] = [
      {
        id: "block-range",
        startDate: TEST_DATE,
        endDate: TEST_DATE,
        isFullDay: false,
        startTime: "12:00",
        endTime: "14:00",
        reason: "הפסקה",
        createdAt: "2026-06-22T08:00:00.000Z",
      },
    ];

    const slots = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service60,
      appointments: [],
      businessSettings,
      blockedTimes,
    });

    expect(slotStartTimes(slots)).not.toContain("12:00");
    expect(slotStartTimes(slots)).not.toContain("12:30");
    expect(slotStartTimes(slots)).not.toContain("13:00");
    expect(slotStartTimes(slots)).not.toContain("13:30");
    expect(slotStartTimes(slots)).toContain("11:00");
    expect(slotStartTimes(slots)).toContain("14:00");
  });

  it("returns no slots for any date inside a full-day vacation range", () => {
    const blockedTimes: BlockedTime[] = [
      {
        id: "vacation",
        startDate: "2026-07-01",
        endDate: "2026-07-05",
        isFullDay: true,
        reason: "חופשה",
        createdAt: "2026-06-22T08:00:00.000Z",
      },
    ];

    expect(isDateFullyBlocked("2026-07-03", blockedTimes)).toBe(true);
    expect(
      getAvailableSlots({
        selectedDate: "2026-07-03",
        selectedService: service20,
        appointments: [],
        businessSettings,
        blockedTimes,
      })
    ).toEqual([]);
  });

  it("does not block dates outside a full-day vacation range", () => {
    const blockedTimes: BlockedTime[] = [
      {
        id: "vacation",
        startDate: "2026-07-01",
        endDate: "2026-07-05",
        isFullDay: true,
        createdAt: "2026-06-22T08:00:00.000Z",
      },
    ];

    expect(isDateFullyBlocked("2026-06-30", blockedTimes)).toBe(false);
    expect(isDateFullyBlocked("2026-07-06", blockedTimes)).toBe(false);

    const slots = getAvailableSlots({
      selectedDate: "2026-06-30",
      selectedService: service20,
      appointments: [],
      businessSettings,
      blockedTimes,
    });

    expect(slots.length).toBeGreaterThan(0);
  });

  it("applies partial time blocks to each day in a multi-day range", () => {
    const blockedTimes: BlockedTime[] = [
      {
        id: "lunch-range",
        startDate: "2026-07-06",
        endDate: "2026-07-08",
        isFullDay: false,
        startTime: "12:00",
        endTime: "16:00",
        createdAt: "2026-06-22T08:00:00.000Z",
      },
    ];

    const slots = getAvailableSlots({
      selectedDate: "2026-07-07",
      selectedService: service60,
      appointments: [],
      businessSettings,
      blockedTimes,
    });

    expect(slotStartTimes(slots)).not.toContain("12:00");
    expect(slotStartTimes(slots)).not.toContain("13:30");
    expect(slotStartTimes(slots)).toContain("11:00");
    expect(slotStartTimes(slots)).toContain("16:00");
  });
});

describe("isBlockingAppointmentStatus", () => {
  it("blocks pending, confirmed, and completed appointments", () => {
    expect(isBlockingAppointmentStatus("pending")).toBe(true);
    expect(isBlockingAppointmentStatus("confirmed")).toBe(true);
    expect(isBlockingAppointmentStatus("completed")).toBe(true);
  });

  it("does not block cancelled appointments", () => {
    expect(isBlockingAppointmentStatus("cancelled")).toBe(false);
  });
});

describe("doesSlotConflictWithBufferedAppointment", () => {
  it("blocks a candidate ending exactly at an existing start when buffer is required", () => {
    expect(
      doesSlotConflictWithBufferedAppointment(
        "09:30",
        "10:00",
        "10:00",
        "11:00",
        15
      )
    ).toBe(true);
  });

  it("allows a candidate that leaves buffer before an existing appointment", () => {
    expect(
      doesSlotConflictWithBufferedAppointment(
        "09:15",
        "09:45",
        "10:00",
        "11:00",
        15
      )
    ).toBe(false);
  });

  it("blocks a candidate starting immediately after an existing appointment", () => {
    expect(
      doesSlotConflictWithBufferedAppointment(
        "11:00",
        "11:30",
        "10:00",
        "11:00",
        15
      )
    ).toBe(true);
  });
});

describe("DEFAULT_SLOT_INTERVAL_MINUTES", () => {
  it("defaults slot grid to 30 minutes", () => {
    expect(DEFAULT_SLOT_INTERVAL_MINUTES).toBe(30);
  });
});
