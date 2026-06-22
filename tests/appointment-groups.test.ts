import { describe, expect, it } from "vitest";
import {
  groupAppointmentsByDay,
  isAppointmentUpcomingOrToday,
  sortAppointmentsByDateTime,
} from "@/lib/appointment-groups";
import type { Appointment } from "@/lib/types";

function createAppointment(
  overrides: Partial<Appointment> = {}
): Appointment {
  return {
    id: "apt-1",
    serviceId: "1",
    customerName: "Test Customer",
    customerPhone: "050-000-0000",
    appointmentDate: "2026-06-22",
    startTime: "10:00",
    endTime: "11:00",
    status: "confirmed",
    createdAt: "2026-06-22T08:00:00.000Z",
    ...overrides,
  };
}

describe("sortAppointmentsByDateTime", () => {
  it("sorts by date then start time ascending", () => {
    const sorted = sortAppointmentsByDateTime([
      createAppointment({ id: "b", appointmentDate: "2026-06-23", startTime: "09:00" }),
      createAppointment({ id: "a", appointmentDate: "2026-06-22", startTime: "15:00" }),
      createAppointment({ id: "c", appointmentDate: "2026-06-22", startTime: "09:00" }),
    ]);

    expect(sorted.map((appointment) => appointment.id)).toEqual(["c", "a", "b"]);
  });
});

describe("groupAppointmentsByDay", () => {
  it("groups sorted appointments by date with Hebrew labels", () => {
    const groups = groupAppointmentsByDay([
      createAppointment({ id: "1", appointmentDate: "2026-06-23", startTime: "11:00" }),
      createAppointment({ id: "2", appointmentDate: "2026-06-22", startTime: "14:00" }),
      createAppointment({ id: "3", appointmentDate: "2026-06-22", startTime: "09:00" }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].date).toBe("2026-06-22");
    expect(groups[0].appointments.map((item) => item.id)).toEqual(["3", "2"]);
    expect(groups[0].label.length).toBeGreaterThan(0);
    expect(groups[1].date).toBe("2026-06-23");
  });
});

describe("isAppointmentUpcomingOrToday", () => {
  const today = "2026-06-22";

  it("includes today and future non-cancelled appointments", () => {
    expect(
      isAppointmentUpcomingOrToday(
        createAppointment({ appointmentDate: today, status: "pending" }),
        today
      )
    ).toBe(true);
    expect(
      isAppointmentUpcomingOrToday(
        createAppointment({ appointmentDate: "2026-06-23", status: "confirmed" }),
        today
      )
    ).toBe(true);
  });

  it("excludes past dates and inactive statuses", () => {
    expect(
      isAppointmentUpcomingOrToday(
        createAppointment({ appointmentDate: "2026-06-21" }),
        today
      )
    ).toBe(false);
    expect(
      isAppointmentUpcomingOrToday(
        createAppointment({ status: "cancelled" }),
        today
      )
    ).toBe(false);
    expect(
      isAppointmentUpcomingOrToday(
        createAppointment({ status: "completed" }),
        today
      )
    ).toBe(false);
  });
});
