import { describe, expect, it } from "vitest";
import {
  applyQuickDateFilter,
  filterAppointments,
  filterAppointmentsWithQuickRange,
} from "@/lib/appointment-filters";
import { appointmentStatusLabels } from "@/lib/i18n";
import type { Appointment } from "@/lib/types";

function createAppointment(
  overrides: Partial<Appointment> = {}
): Appointment {
  return {
    id: "apt-1",
    serviceId: "1",
    customerName: "ישראל ישראלי",
    customerPhone: "050-123-4567",
    appointmentDate: "2026-06-22",
    startTime: "10:00",
    endTime: "11:00",
    status: "confirmed",
    createdAt: "2026-06-22T08:00:00.000Z",
    ...overrides,
  };
}

describe("appointmentStatusLabels", () => {
  it("includes completed status in Hebrew", () => {
    expect(appointmentStatusLabels.completed).toBe("הושלם");
  });
});

describe("filterAppointments", () => {
  const appointments = [
    createAppointment({
      id: "1",
      customerName: "ישראל ישראלי",
      customerPhone: "050-123-4567",
      status: "pending",
      appointmentDate: "2026-06-22",
    }),
    createAppointment({
      id: "2",
      customerName: "שרה כהן",
      customerPhone: "052-987-6543",
      status: "confirmed",
      appointmentDate: "2026-06-23",
    }),
    createAppointment({
      id: "3",
      customerName: "דנה לוי",
      customerPhone: "054-111-2222",
      status: "completed",
      appointmentDate: "2026-06-22",
    }),
  ];

  it("matches customer name search", () => {
    const result = filterAppointments(appointments, {
      searchQuery: "שרה",
      status: "all",
      date: "",
    });

    expect(result.map((item) => item.id)).toEqual(["2"]);
  });

  it("matches customer phone search", () => {
    const result = filterAppointments(appointments, {
      searchQuery: "501234567",
      status: "all",
      date: "",
    });

    expect(result.map((item) => item.id)).toEqual(["1"]);
  });

  it("filters by status", () => {
    const result = filterAppointments(appointments, {
      searchQuery: "",
      status: "completed",
      date: "",
    });

    expect(result.map((item) => item.id)).toEqual(["3"]);
  });

  it("filters by date", () => {
    const result = filterAppointments(appointments, {
      searchQuery: "",
      status: "all",
      date: "2026-06-22",
    });

    expect(result.map((item) => item.id)).toEqual(["1", "3"]);
  });

  it("combines search, status, and date filters", () => {
    const result = filterAppointments(appointments, {
      searchQuery: "ישראל",
      status: "pending",
      date: "2026-06-22",
    });

    expect(result.map((item) => item.id)).toEqual(["1"]);
  });
});

describe("applyQuickDateFilter", () => {
  const today = "2026-06-22";
  const appointments = [
    createAppointment({ id: "today", appointmentDate: today }),
    createAppointment({ id: "tomorrow", appointmentDate: "2026-06-23" }),
    createAppointment({ id: "next-week", appointmentDate: "2026-06-29" }),
    createAppointment({ id: "past", appointmentDate: "2026-06-20" }),
  ];

  it("filters today only", () => {
    const result = applyQuickDateFilter(appointments, "today", today);
    expect(result.map((item) => item.id)).toEqual(["today"]);
  });

  it("filters tomorrow only", () => {
    const result = applyQuickDateFilter(appointments, "tomorrow", today);
    expect(result.map((item) => item.id)).toEqual(["tomorrow"]);
  });

  it("filters the next seven days including today", () => {
    const result = applyQuickDateFilter(appointments, "week", today);
    expect(result.map((item) => item.id)).toEqual([
      "today",
      "tomorrow",
      "next-week",
    ]);
  });

  it("returns all appointments for the all filter", () => {
    expect(applyQuickDateFilter(appointments, "all", today)).toHaveLength(4);
  });
});

describe("filterAppointmentsWithQuickRange", () => {
  const today = "2026-06-22";
  const appointments = [
    createAppointment({
      id: "1",
      customerName: "ישראל ישראלי",
      status: "pending",
      appointmentDate: today,
    }),
    createAppointment({
      id: "2",
      customerName: "שרה כהן",
      status: "confirmed",
      appointmentDate: "2026-06-23",
    }),
  ];

  it("combines status filter with quick week filter", () => {
    const result = filterAppointmentsWithQuickRange(
      appointments,
      { searchQuery: "", status: "confirmed", date: "" },
      "week",
      today
    );

    expect(result.map((item) => item.id)).toEqual(["2"]);
  });
});
