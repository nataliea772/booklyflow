import { describe, expect, it } from "vitest";
import {
  calculateExpectedRevenue,
  getUpcomingAppointments,
  isUpcomingAppointment,
} from "@/lib/dashboard-stats";
import type { Appointment } from "@/lib/types";

const today = "2026-06-22";
const now = new Date("2026-06-22T14:00:00");

function createAppointment(
  overrides: Partial<Appointment> = {}
): Appointment {
  return {
    id: "apt-1",
    serviceId: "1",
    customerName: "Test Customer",
    customerPhone: "050-000-0000",
    appointmentDate: today,
    startTime: "10:00",
    endTime: "11:00",
    status: "confirmed",
    createdAt: `${today}T08:00:00.000Z`,
    ...overrides,
  };
}

const prices: Record<string, number> = {
  "1": 55,
  "2": 120,
  "5": 0,
};

function getServicePrice(serviceId: string): number {
  return prices[serviceId] ?? 0;
}

describe("isUpcomingAppointment", () => {
  it("excludes cancelled appointments", () => {
    expect(
      isUpcomingAppointment(
        createAppointment({ status: "cancelled" }),
        today,
        now
      )
    ).toBe(false);
  });

  it("excludes completed appointments", () => {
    expect(
      isUpcomingAppointment(
        createAppointment({ status: "completed" }),
        today,
        now
      )
    ).toBe(false);
  });

  it("excludes past dates", () => {
    expect(
      isUpcomingAppointment(
        createAppointment({ appointmentDate: "2026-06-21" }),
        today,
        now
      )
    ).toBe(false);
  });

  it("includes future dates regardless of status except cancelled", () => {
    expect(
      isUpcomingAppointment(
        createAppointment({
          appointmentDate: "2026-06-23",
          status: "pending",
        }),
        today,
        now
      )
    ).toBe(true);
  });

  it("excludes today's appointments that already started", () => {
    expect(
      isUpcomingAppointment(
        createAppointment({ startTime: "09:00", endTime: "10:00" }),
        today,
        now
      )
    ).toBe(false);
  });

  it("includes today's appointments that have not started yet", () => {
    expect(
      isUpcomingAppointment(
        createAppointment({ startTime: "16:00", endTime: "17:00" }),
        today,
        now
      )
    ).toBe(true);
  });
});

describe("calculateExpectedRevenue", () => {
  it("sums only confirmed upcoming appointments", () => {
    const appointments = [
      createAppointment({ id: "1", serviceId: "1", startTime: "16:00" }),
      createAppointment({
        id: "2",
        serviceId: "2",
        appointmentDate: "2026-06-23",
        status: "pending",
      }),
      createAppointment({
        id: "3",
        serviceId: "1",
        appointmentDate: "2026-06-21",
        status: "confirmed",
      }),
      createAppointment({
        id: "4",
        serviceId: "5",
        appointmentDate: "2026-06-23",
        status: "confirmed",
      }),
      createAppointment({
        id: "5",
        serviceId: "1",
        startTime: "09:00",
        status: "confirmed",
      }),
    ];

    expect(
      calculateExpectedRevenue(appointments, getServicePrice, today, now)
    ).toBe(55);
  });

  it("excludes completed appointments from expected revenue", () => {
    const appointments = [
      createAppointment({
        id: "completed-upcoming",
        serviceId: "2",
        startTime: "16:00",
        status: "completed",
      }),
      createAppointment({
        id: "confirmed-upcoming",
        serviceId: "1",
        startTime: "16:00",
        status: "confirmed",
      }),
    ];

    expect(
      calculateExpectedRevenue(appointments, getServicePrice, today, now)
    ).toBe(55);
  });
});

describe("getUpcomingAppointments", () => {
  it("returns upcoming appointments sorted by date and time", () => {
    const appointments = [
      createAppointment({
        id: "late",
        appointmentDate: "2026-06-24",
        startTime: "10:00",
        status: "pending",
      }),
      createAppointment({
        id: "soon",
        appointmentDate: "2026-06-23",
        startTime: "15:30",
        status: "confirmed",
      }),
      createAppointment({
        id: "today-later",
        startTime: "16:00",
        status: "pending",
      }),
      createAppointment({
        id: "past",
        startTime: "09:00",
        status: "confirmed",
      }),
      createAppointment({
        id: "cancelled",
        appointmentDate: "2026-06-23",
        status: "cancelled",
      }),
      createAppointment({
        id: "completed",
        appointmentDate: "2026-06-23",
        status: "completed",
      }),
    ];

    const upcoming = getUpcomingAppointments(appointments, today, 5, now);

    expect(upcoming.map((appointment) => appointment.id)).toEqual([
      "today-later",
      "soon",
      "late",
    ]);
  });

  it("limits results to the requested count", () => {
    const appointments = Array.from({ length: 8 }, (_, index) =>
      createAppointment({
        id: String(index),
        appointmentDate: "2026-06-23",
        startTime: `${10 + index}:00`,
      })
    );

    expect(getUpcomingAppointments(appointments, today, 5, now)).toHaveLength(
      5
    );
  });
});
