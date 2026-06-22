"use client";

import { useCallback, useEffect, useState } from "react";
import { appointments as mockAppointments } from "@/lib/mock-data";
import {
  addStoredAppointment,
  clearStoredAppointments,
  getStatusOverrides,
  getStoredAppointments,
  mergeAppointments,
  updateStoredAppointmentStatus,
} from "@/lib/storage";
import type { Appointment, AppointmentStatus } from "@/lib/types";

function loadMergedAppointments(): Appointment[] {
  return mergeAppointments(
    mockAppointments,
    getStoredAppointments(),
    getStatusOverrides()
  );
}

export function useAppointments() {
  // Start with mock data so server and first client render match (avoids hydration errors).
  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments);
  const [isReady, setIsReady] = useState(false);

  const refreshAppointments = useCallback(() => {
    setAppointments(loadMergedAppointments());
  }, []);

  useEffect(() => {
    refreshAppointments();
    setIsReady(true);
  }, [refreshAppointments]);

  const addAppointment = useCallback((appointment: Appointment) => {
    addStoredAppointment(appointment);
    setAppointments(loadMergedAppointments());
  }, []);

  const updateAppointmentStatus = useCallback(
    (appointmentId: string, status: AppointmentStatus) => {
      updateStoredAppointmentStatus(appointmentId, status);
      setAppointments(loadMergedAppointments());
    },
    []
  );

  const resetDemoData = useCallback(() => {
    clearStoredAppointments();
    setAppointments(mockAppointments);
  }, []);

  return {
    appointments,
    addAppointment,
    updateAppointmentStatus,
    refreshAppointments,
    resetDemoData,
    isReady,
  };
}
