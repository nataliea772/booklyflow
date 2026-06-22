"use client";

import { useCallback, useEffect, useState } from "react";
import { appointments as mockAppointments } from "@/lib/mock-data";
import {
  createAppointment as createSupabaseAppointment,
  getAppointments as getSupabaseAppointments,
  updateAppointmentStatus as updateSupabaseAppointmentStatus,
} from "@/lib/supabase/appointments";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  addStoredAppointment,
  clearStoredAppointments,
  getStatusOverrides,
  getStoredAppointments,
  mergeAppointments,
  updateStoredAppointmentStatus,
} from "@/lib/storage";
import type { Appointment, AppointmentStatus } from "@/lib/types";

function loadDemoAppointments(): Appointment[] {
  return mergeAppointments(
    mockAppointments,
    getStoredAppointments(),
    getStatusOverrides()
  );
}

function getInitialAppointments(): Appointment[] {
  return isSupabaseConfigured() ? [] : mockAppointments;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(
    getInitialAppointments
  );
  const [isReady, setIsReady] = useState(false);

  const refreshAppointments = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const remoteAppointments = await getSupabaseAppointments();
      setAppointments(remoteAppointments);
      return;
    }

    setAppointments(loadDemoAppointments());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAppointments() {
      if (isSupabaseConfigured()) {
        const remoteAppointments = await getSupabaseAppointments();
        if (!cancelled) {
          setAppointments(remoteAppointments);
          setIsReady(true);
        }
        return;
      }

      if (!cancelled) {
        setAppointments(loadDemoAppointments());
        setIsReady(true);
      }
    }

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, []);

  const addAppointment = useCallback(
    async (appointment: Appointment) => {
      if (isSupabaseConfigured()) {
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
      setAppointments(loadDemoAppointments());
    },
    [refreshAppointments]
  );

  const updateAppointmentStatus = useCallback(
    async (appointmentId: string, status: AppointmentStatus) => {
      if (isSupabaseConfigured()) {
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
      setAppointments(loadDemoAppointments());
    },
    [refreshAppointments]
  );

  const resetDemoData = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await refreshAppointments();
      return;
    }

    clearStoredAppointments();
    setAppointments(mockAppointments);
  }, [refreshAppointments]);

  return {
    appointments,
    addAppointment,
    updateAppointmentStatus,
    refreshAppointments,
    resetDemoData,
    isReady,
  };
}
