import { describe, expect, it } from "vitest";
import {
  calculateEndTime,
  doTimeRangesOverlap,
  getAvailableSlots,
  minutesToTime,
  timeToMinutes,
} from "@/lib/availability";
import type {
  Appointment,
  BusinessSettings,
  Service,
} from "@/lib/types";

const TEST_DATE = "2026-06-22";
const CLOSED_DATE = "2026-06-26";

const businessSettings: BusinessSettings = {
  businessName: "BooklyFlow Studio",
  startHour: "09:00",
  endHour: "18:00",
  bufferMinutes: 15,
  workingDays: [0, 1, 2, 3, 4],
};

const service20: Service = {
  id: "consult",
  name: "Consultation",
  description: "Short consultation",
  price: 0,
  durationMinutes: 20,
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

  it("applies bufferMinutes after appointments", () => {
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
});
