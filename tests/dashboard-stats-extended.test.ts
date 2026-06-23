import { describe, expect, it } from "vitest";
import {
  getAverageReviewRating,
  getCancellationRatePercent,
  getMostPopularService,
  getTodayAppointmentsCount,
  getWeekAppointmentsCount,
} from "@/lib/dashboard-stats";
import type { Appointment, CustomerReview } from "@/lib/types";

const today = "2026-06-22";

function createAppointment(
  overrides: Partial<Appointment> = {}
): Appointment {
  return {
    id: "apt-1",
    serviceId: "svc-1",
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

function createReview(
  overrides: Partial<CustomerReview> = {}
): CustomerReview {
  return {
    id: "rev-1",
    customerName: "Customer",
    rating: 5,
    isVisible: true,
    createdAt: "2026-06-20T10:00:00.000Z",
    ...overrides,
  };
}

describe("getTodayAppointmentsCount", () => {
  it("counts non-cancelled appointments for today", () => {
    const appointments = [
      createAppointment({ id: "1", status: "confirmed" }),
      createAppointment({ id: "2", status: "pending" }),
      createAppointment({ id: "3", status: "cancelled" }),
      createAppointment({ id: "4", appointmentDate: "2026-06-23" }),
    ];

    expect(getTodayAppointmentsCount(appointments, today)).toBe(2);
  });
});

describe("getWeekAppointmentsCount", () => {
  it("counts non-cancelled appointments within seven days", () => {
    const appointments = [
      createAppointment({ id: "1" }),
      createAppointment({ id: "2", appointmentDate: "2026-06-29" }),
      createAppointment({ id: "3", appointmentDate: "2026-06-30" }),
      createAppointment({ id: "4", status: "cancelled" }),
    ];

    expect(getWeekAppointmentsCount(appointments, today)).toBe(2);
  });
});

describe("getMostPopularService", () => {
  it("returns the service with the highest appointment count", () => {
    const appointments = [
      createAppointment({ id: "1", serviceId: "svc-a" }),
      createAppointment({ id: "2", serviceId: "svc-b" }),
      createAppointment({ id: "3", serviceId: "svc-a" }),
      createAppointment({ id: "4", serviceId: "svc-a", status: "cancelled" }),
    ];

    expect(getMostPopularService(appointments)).toEqual({
      serviceId: "svc-a",
      count: 2,
    });
  });

  it("returns null when there are no eligible appointments", () => {
    expect(getMostPopularService([])).toBeNull();
  });
});

describe("getAverageReviewRating", () => {
  it("averages visible reviews only by default", () => {
    const reviews = [
      createReview({ rating: 5 }),
      createReview({ id: "rev-2", rating: 3 }),
      createReview({ id: "rev-3", rating: 1, isVisible: false }),
    ];

    expect(getAverageReviewRating(reviews)).toBe(4);
  });

  it("returns null when there are no eligible reviews", () => {
    expect(getAverageReviewRating([])).toBeNull();
  });
});

describe("getCancellationRatePercent", () => {
  it("returns zero when there are no appointments", () => {
    expect(getCancellationRatePercent([])).toBe(0);
  });

  it("returns cancelled percentage rounded to one decimal", () => {
    const appointments = [
      createAppointment({ id: "1", status: "cancelled" }),
      createAppointment({ id: "2", status: "confirmed" }),
      createAppointment({ id: "3", status: "pending" }),
    ];

    expect(getCancellationRatePercent(appointments)).toBe(33.3);
  });
});
