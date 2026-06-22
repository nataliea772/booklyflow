import { appointments as mockAppointments } from "./mock-data";
import type { Appointment, AppointmentStatus } from "./types";

export const APPOINTMENTS_STORAGE_KEY = "booklyflow-appointments";
const STATUS_OVERRIDES_STORAGE_KEY = "booklyflow-appointment-status-overrides";

const mockAppointmentIds = new Set(mockAppointments.map((item) => item.id));

function isAppointment(value: unknown): value is Appointment {
  if (!value || typeof value !== "object") return false;

  const appointment = value as Appointment;

  return (
    typeof appointment.id === "string" &&
    typeof appointment.serviceId === "string" &&
    typeof appointment.customerName === "string" &&
    typeof appointment.customerPhone === "string" &&
    typeof appointment.appointmentDate === "string" &&
    typeof appointment.startTime === "string" &&
    typeof appointment.endTime === "string" &&
    (appointment.status === "pending" ||
      appointment.status === "confirmed" ||
      appointment.status === "cancelled") &&
    typeof appointment.createdAt === "string"
  );
}

function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return (
    value === "pending" || value === "confirmed" || value === "cancelled"
  );
}

export function getStatusOverrides(): Record<string, AppointmentStatus> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STATUS_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    const overrides: Record<string, AppointmentStatus> = {};

    for (const [id, status] of Object.entries(parsed)) {
      if (typeof id === "string" && isAppointmentStatus(status)) {
        overrides[id] = status;
      }
    }

    return overrides;
  } catch {
    return {};
  }
}

function saveStatusOverrides(
  overrides: Record<string, AppointmentStatus>
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STATUS_OVERRIDES_STORAGE_KEY,
      JSON.stringify(overrides)
    );
  } catch {
    // Ignore quota or privacy-mode errors.
  }
}

/** Combines mock seed data, user-created storage, and mock status overrides. */
export function mergeAppointments(
  baseAppointments: Appointment[],
  storedAppointments: Appointment[],
  statusOverrides: Record<string, AppointmentStatus> = {}
): Appointment[] {
  const byId = new Map<string, Appointment>();

  for (const appointment of baseAppointments) {
    const override = statusOverrides[appointment.id];
    byId.set(
      appointment.id,
      override ? { ...appointment, status: override } : appointment
    );
  }

  for (const appointment of storedAppointments) {
    byId.set(appointment.id, appointment);
  }

  return Array.from(byId.values()).sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt)
  );
}

export function getStoredAppointments(): Appointment[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isAppointment)
      .filter((appointment) => !mockAppointmentIds.has(appointment.id));
  } catch {
    return [];
  }
}

export function saveStoredAppointments(appointments: Appointment[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const userAppointments = appointments.filter(
    (appointment) => !mockAppointmentIds.has(appointment.id)
  );

  try {
    window.localStorage.setItem(
      APPOINTMENTS_STORAGE_KEY,
      JSON.stringify(userAppointments)
    );
  } catch {
    // Ignore quota or privacy-mode errors.
  }
}

export function clearStoredAppointments(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(APPOINTMENTS_STORAGE_KEY);
    window.localStorage.removeItem(STATUS_OVERRIDES_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

export function addStoredAppointment(appointment: Appointment): Appointment[] {
  if (mockAppointmentIds.has(appointment.id)) {
    return getStoredAppointments();
  }

  const stored = getStoredAppointments();

  if (stored.some((item) => item.id === appointment.id)) {
    return stored;
  }

  const updated = [...stored, appointment];
  saveStoredAppointments(updated);
  return updated;
}

export function updateStoredAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Appointment[] {
  const stored = getStoredAppointments();
  const storedIndex = stored.findIndex((item) => item.id === appointmentId);

  if (storedIndex >= 0) {
    const updated = [...stored];
    updated[storedIndex] = { ...updated[storedIndex], status };
    saveStoredAppointments(updated);
    return updated;
  }

  if (mockAppointmentIds.has(appointmentId)) {
    const overrides = getStatusOverrides();
    overrides[appointmentId] = status;
    saveStatusOverrides(overrides);
  }

  return stored;
}

export function getMergedAppointments(): Appointment[] {
  return mergeAppointments(
    mockAppointments,
    getStoredAppointments(),
    getStatusOverrides()
  );
}
