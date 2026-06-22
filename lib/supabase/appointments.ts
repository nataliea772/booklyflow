import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { mapAppointmentRow, type AppointmentRow } from "@/lib/supabase/mappers";
import type { Appointment, AppointmentStatus } from "@/lib/types";

export type AppointmentInput = {
  serviceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status?: AppointmentStatus;
  notes?: string;
};

export async function getAppointments(): Promise<Appointment[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch appointments:", error.message);
    return [];
  }

  return (data as AppointmentRow[]).map(mapAppointmentRow);
}

export async function createAppointment(
  input: AppointmentInput
): Promise<Appointment | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      service_id: input.serviceId,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail ?? null,
      appointment_date: input.appointmentDate,
      start_time: input.startTime,
      end_time: input.endTime,
      status: input.status ?? "pending",
      notes: input.notes ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create appointment:", error.message);
    return null;
  }

  return mapAppointmentRow(data as AppointmentRow);
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<Appointment | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update appointment status:", error.message);
    return null;
  }

  return mapAppointmentRow(data as AppointmentRow);
}
