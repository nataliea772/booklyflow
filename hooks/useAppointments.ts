"use client";

import { useCallback, useEffect, useState } from "react";
import { appointments as fallbackAppointments } from "@/lib/mock-data";
import {
  createAppointment as createSupabaseAppointment,
  getAppointments as getSupabaseAppointments,
  updateAppointmentStatus as updateSupabaseAppointmentStatus,
} from "@/lib/supabase/appointments";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  addStoredAppointment,
  getStatusOverrides,
  getStoredAppointments,
  mergeAppointments,
  updateStoredAppointmentStatus,
} from "@/lib/storage";
import type { Appointment, AppointmentStatus } from "@/lib/types";

function loadFallbackAppointments(): Appointment[] {
  return mergeAppointments(
    fallbackAppointments,
    getStoredAppointments(),
    getStatusOverrides()
  );
}

function getInitialAppointments(): Appointment[] {
  return isSupabaseConfigured() ? [] : loadFallbackAppointments();
}

export function useAppointments() {
  const usesDatabase = isSupabaseConfigured();
  const [appointments, setAppointments] = useState<Appointment[]>(
    getInitialAppointments
  );
  const [isReady, setIsReady] = useState(!usesDatabase);

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
      if (usesDatabase) {
        const remoteAppointments = await getSupabaseAppointments();
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
    }

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, [usesDatabase]);

  const addAppointment = useCallback(
    async (appointment: Appointment) => {
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
        } else {
          await refreshAppointments();
        }
        return;
      }

      addStoredAppointment(appointment);
      setAppointments(loadFallbackAppointments());
    },
    [usesDatabase, refreshAppointments]
  );

  const updateAppointmentStatus = useCallback(
    async (appointmentId: string, status: AppointmentStatus) => {
      if (usesDatabase) {
        const updated = await updateSupabaseAppointmentStatus(
          appointmentId,
          status
        );

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

  return {
    appointments,
    addAppointment,
    updateAppointmentStatus,
    refreshAppointments,
    isReady,
    usesDatabase,
  };
}
