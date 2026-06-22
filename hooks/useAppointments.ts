"use client";

import { useCallback, useEffect, useState } from "react";
import { appointments as fallbackAppointments } from "@/lib/mock-data";
import {
  createAppointment as createSupabaseAppointment,
  deleteAppointment as deleteSupabaseAppointment,
  DeleteAppointmentError,
  getAppointments as getSupabaseAppointments,
  updateAppointment as updateSupabaseAppointment,
  type UpdateAppointmentInput,
} from "@/lib/supabase/appointments";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  addStoredAppointment,
  deleteStoredAppointment,
  getMergedAppointments,
  updateStoredAppointment,
  updateStoredAppointmentStatus,
} from "@/lib/storage";
import type { Appointment, AppointmentStatus } from "@/lib/types";

export type DeleteAppointmentResult =
  | { ok: true }
  | { ok: false; code: "foreign_key" | "not_found" | "unknown" };

function loadFallbackAppointments(): Appointment[] {
  return getMergedAppointments();
}

function getInitialAppointments(): Appointment[] {
  if (isSupabaseConfigured() || typeof window === "undefined") {
    return [];
  }
  return loadFallbackAppointments();
}

export function useAppointments() {
  const usesDatabase = isSupabaseConfigured();
  const [appointments, setAppointments] = useState<Appointment[]>(
    getInitialAppointments
  );
  const [isReady, setIsReady] = useState(false);

  const refreshAppointments = useCallback(async () => {
    if (usesDatabase) {
      setAppointments(await getSupabaseAppointments());
      return;
    }

    setAppointments(loadFallbackAppointments());
  }, [usesDatabase]);

  useEffect(() => {
    let cancelled = false;

    async function loadAppointments() {
      try {
        if (usesDatabase) {
          const { getAppointments } = await import(
            "@/lib/supabase/appointments"
          );
          const remoteAppointments = await getAppointments();
          if (!cancelled) {
            setAppointments(remoteAppointments);
            setIsReady(true);
          }
          return;
        }

        if (!cancelled) {
          setAppointments(loadFallbackAppointments());
          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to load appointments:", error);
        if (!cancelled) {
          setAppointments(
            usesDatabase ? [] : loadFallbackAppointments()
          );
          setIsReady(true);
        }
      }
    }

    if (usesDatabase || typeof window !== "undefined") {
      loadAppointments();
    }

    return () => {
      cancelled = true;
    };
  }, [usesDatabase]);

  const addAppointment = useCallback(
    async (appointment: Appointment): Promise<Appointment | null> => {
      if (usesDatabase) {
        const created = await createSupabaseAppointment({
          serviceId: appointment.serviceId,
          customerName: appointment.customerName,
          customerPhone: appointment.customerPhone,
          customerEmail: appointment.customerEmail,
          appointmentDate: appointment.appointmentDate,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          notes: appointment.notes,
        });

        if (created) {
          setAppointments((current) =>
            [...current, created].sort((a, b) =>
              b.createdAt.localeCompare(a.createdAt)
            )
          );
          return created;
        }

        await refreshAppointments();
        return null;
      }

      addStoredAppointment(appointment);
      setAppointments(loadFallbackAppointments());
      return appointment;
    },
    [usesDatabase, refreshAppointments]
  );

  const updateAppointmentStatus = useCallback(
    async (appointmentId: string, status: AppointmentStatus) => {
      if (usesDatabase) {
        const { updateAppointmentStatus: updateRemoteStatus } = await import(
          "@/lib/supabase/appointments"
        );
        const updated = await updateRemoteStatus(appointmentId, status);

        if (updated) {
          setAppointments((current) =>
            current.map((appointment) =>
              appointment.id === appointmentId ? updated : appointment
            )
          );
        } else {
          await refreshAppointments();
        }
        return;
      }

      updateStoredAppointmentStatus(appointmentId, status);
      setAppointments(loadFallbackAppointments());
    },
    [usesDatabase, refreshAppointments]
  );

  const updateAppointment = useCallback(
    async (
      appointmentId: string,
      input: UpdateAppointmentInput
    ): Promise<Appointment | null> => {
      if (usesDatabase) {
        const updated = await updateSupabaseAppointment(appointmentId, input);

        if (updated) {
          setAppointments((current) =>
            current.map((appointment) =>
              appointment.id === appointmentId ? updated : appointment
            )
          );
          return updated;
        }

        await refreshAppointments();
        return null;
      }

      const existing = loadFallbackAppointments().find(
        (appointment) => appointment.id === appointmentId
      );

      if (!existing) {
        return null;
      }

      const updated: Appointment = {
        ...existing,
        ...(input.serviceId !== undefined ? { serviceId: input.serviceId } : {}),
        ...(input.customerName !== undefined
          ? { customerName: input.customerName }
          : {}),
        ...(input.customerPhone !== undefined
          ? { customerPhone: input.customerPhone }
          : {}),
        ...(input.customerEmail !== undefined
          ? { customerEmail: input.customerEmail ?? undefined }
          : {}),
        ...(input.appointmentDate !== undefined
          ? { appointmentDate: input.appointmentDate }
          : {}),
        ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
        ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.notes !== undefined
          ? { notes: input.notes ?? undefined }
          : {}),
        ...(input.adminNote !== undefined
          ? { adminNote: input.adminNote ?? undefined }
          : {}),
      };

      updateStoredAppointment(updated);
      setAppointments(loadFallbackAppointments());
      return updated;
    },
    [usesDatabase, refreshAppointments]
  );

  const deleteAppointment = useCallback(
    async (appointmentId: string): Promise<DeleteAppointmentResult> => {
      if (usesDatabase) {
        try {
          await deleteSupabaseAppointment(appointmentId);
          setAppointments((current) =>
            current.filter((appointment) => appointment.id !== appointmentId)
          );
          return { ok: true };
        } catch (error) {
          if (error instanceof DeleteAppointmentError) {
            return { ok: false, code: error.code };
          }

          return { ok: false, code: "unknown" };
        }
      }

      deleteStoredAppointment(appointmentId);
      setAppointments(loadFallbackAppointments());
      return { ok: true };
    },
    [usesDatabase]
  );

  return {
    appointments,
    addAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    refreshAppointments,
    isReady,
    usesDatabase,
  };
}
