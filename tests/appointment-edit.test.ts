import { describe, expect, it } from "vitest";
import {
  formatWorkingDaysLabels,
  isAppointmentPast,
  validateAppointmentSlot,
} from "@/lib/appointment-edit";
import { getAvailableSlots } from "@/lib/availability";
import type {
  Appointment,
  BlockedTime,
  BusinessSettings,
  Service,
} from "@/lib/types";
import { workingHoursFromLegacy } from "@/lib/working-hours";

const TEST_DATE = "2026-06-22";

const businessSettings: BusinessSettings = {
  businessName: "Test Studio",
  startHour: "09:00",
  endHour: "18:00",
  bufferMinutes: 15,
  workingDays: [0, 1, 2, 3, 4],
  workingHours: workingHoursFromLegacy([0, 1, 2, 3, 4], "09:00", "18:00"),
};

const service60: Service = {
  id: "massage",
  name: "Massage",
  description: "60 minutes",
  price: 85,
  durationMinutes: 60,
  isActive: true,
};

function createAppointment(
  overrides: Partial<Appointment> &
    Pick<Appointment, "id" | "startTime" | "endTime" | "status">
): Appointment {
  return {
    serviceId: "1",
    customerName: "Test Customer",
    customerPhone: "050-000-0000",
    appointmentDate: TEST_DATE,
    createdAt: "2026-06-22T08:00:00.000Z",
    ...overrides,
  };
}

describe("formatWorkingDaysLabels", () => {
  it("formats selected working days in Hebrew", () => {
    expect(formatWorkingDaysLabels([0, 1, 2, 3, 4])).toBe(
      "ראשון · שני · שלישי · רביעי · חמישי"
    );
  });
});

describe("isAppointmentPast", () => {
  it("returns true for past dates", () => {
    expect(
      isAppointmentPast(
        { appointmentDate: "2026-06-21", endTime: "10:00" },
        "2026-06-22"
      )
    ).toBe(true);
  });

  it("returns false for future dates", () => {
    expect(
      isAppointmentPast(
        { appointmentDate: "2026-06-23", endTime: "10:00" },
        "2026-06-22"
      )
    ).toBe(false);
  });
});

describe("getAvailableSlots excludeAppointmentId", () => {
  it("keeps the current appointment slot available when editing", () => {
    const existing = createAppointment({
      id: "edit-me",
      startTime: "10:00",
      endTime: "11:00",
      status: "confirmed",
    });

    const withoutExclude = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service60,
      appointments: [existing],
      businessSettings,
    });

    const withExclude = getAvailableSlots({
      selectedDate: TEST_DATE,
      selectedService: service60,
      appointments: [existing],
      businessSettings,
      excludeAppointmentId: "edit-me",
    });

    expect(withoutExclude.some((slot) => slot.startTime === "10:00")).toBe(
      false
    );
    expect(withExclude.some((slot) => slot.startTime === "10:00")).toBe(true);
  });
});

describe("validateAppointmentSlot", () => {
  it("rejects non-working days", () => {
    const result = validateAppointmentSlot({
      service: service60,
      appointmentDate: "2026-06-26",
      startTime: "10:00",
      appointments: [],
      businessSettings,
      status: "confirmed",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.message).toBe("העסק אינו פעיל ביום זה.");
    }
  });

  it("rejects fully blocked dates", () => {
    const blockedTimes: BlockedTime[] = [
      {
        id: "block-full",
        startDate: TEST_DATE,
        endDate: TEST_DATE,
        isFullDay: true,
        createdAt: "2026-06-22T08:00:00.000Z",
      },
    ];

    const result = validateAppointmentSlot({
      service: service60,
      appointmentDate: TEST_DATE,
      startTime: "10:00",
      appointments: [],
      businessSettings,
      blockedTimes,
      status: "confirmed",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.message).toBe("התאריך שנבחר אינו זמין להזמנות.");
    }
  });

  it("allows moving an appointment into its own slot when excluded", () => {
    const existing = createAppointment({
      id: "edit-me",
      startTime: "10:00",
      endTime: "11:00",
      status: "confirmed",
    });

    const result = validateAppointmentSlot({
      service: service60,
      appointmentDate: TEST_DATE,
      startTime: "10:00",
      appointments: [existing],
      businessSettings,
      excludeAppointmentId: "edit-me",
      status: "confirmed",
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.endTime).toBe("11:00");
    }
  });

  it("rejects overlapping slots", () => {
    const blocker = createAppointment({
      id: "other",
      startTime: "10:00",
      endTime: "11:00",
      status: "confirmed",
    });

    const result = validateAppointmentSlot({
      service: service60,
      appointmentDate: TEST_DATE,
      startTime: "10:00",
      appointments: [blocker],
      businessSettings,
      status: "pending",
    });

    expect(result.valid).toBe(false);
  });
});
