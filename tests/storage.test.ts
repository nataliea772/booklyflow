import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appointments as mockAppointments } from "@/lib/mock-data";
import {
  APPOINTMENTS_STORAGE_KEY,
  addStoredAppointment,
  clearStoredAppointments,
  getMergedAppointments,
  getStoredAppointments,
  mergeAppointments,
  updateStoredAppointmentStatus,
} from "@/lib/storage";
import type { Appointment } from "@/lib/types";

function createStoredAppointment(
  overrides: Partial<Appointment> = {}
): Appointment {
  return {
    id: "apt-test-1",
    serviceId: "1",
    customerName: "Stored Customer",
    customerPhone: "(555) 111-2222",
    appointmentDate: "2026-06-22",
    startTime: "09:00",
    endTime: "09:45",
    status: "pending",
    createdAt: "2026-06-22T10:00:00.000Z",
    ...overrides,
  };
}

describe("storage", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};

    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns an empty array when JSON is invalid", () => {
    store[APPOINTMENTS_STORAGE_KEY] = "{ not valid json";

    expect(getStoredAppointments()).toEqual([]);
  });

  it("does not duplicate appointment IDs when adding the same appointment twice", () => {
    const appointment = createStoredAppointment();

    addStoredAppointment(appointment);
    addStoredAppointment(appointment);

    expect(getStoredAppointments()).toHaveLength(1);
  });

  it("updates status for a stored appointment without creating duplicates", () => {
    const appointment = createStoredAppointment({ id: "apt-update-1" });

    addStoredAppointment(appointment);
    updateStoredAppointmentStatus("apt-update-1", "confirmed");

    const stored = getStoredAppointments();
    expect(stored).toHaveLength(1);
    expect(stored[0].status).toBe("confirmed");
  });

  it("updates mock appointment status via overrides without storing mock rows", () => {
    updateStoredAppointmentStatus("1", "cancelled");

    expect(getStoredAppointments()).toEqual([]);

    const merged = getMergedAppointments();
    const updatedMock = merged.find((appointment) => appointment.id === "1");

    expect(updatedMock?.status).toBe("cancelled");
  });

  it("clears stored appointments and status overrides on reset", () => {
    addStoredAppointment(createStoredAppointment({ id: "apt-clear-1" }));
    updateStoredAppointmentStatus("1", "cancelled");

    clearStoredAppointments();

    expect(getStoredAppointments()).toEqual([]);

    const merged = getMergedAppointments();
    expect(merged.map((appointment) => appointment.id).sort()).toEqual(
      mockAppointments.map((appointment) => appointment.id).sort()
    );
    expect(merged.find((appointment) => appointment.id === "1")?.status).toBe(
      "confirmed"
    );
  });

  it("merges mock and stored appointments without duplicate IDs", () => {
    const stored = createStoredAppointment({ id: "apt-merge-1" });
    const merged = mergeAppointments(mockAppointments, [stored]);

    const ids = merged.map((appointment) => appointment.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("apt-merge-1");
    expect(ids).toContain("1");
  });
});
