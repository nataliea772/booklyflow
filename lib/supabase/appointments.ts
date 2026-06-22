import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { mapAppointmentRow, type AppointmentRow } from "@/lib/supabase/mappers";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidAppointmentId(id: string): boolean {
  return UUID_PATTERN.test(id.trim());
}

function logSupabaseIssue(
  context: string,
  error: { message?: string; code?: string } | null,
  details?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (error) {
    console.error(`[BooklyFlow] ${context}:`, error.message, {
      code: error.code,
      ...details,
    });
    return;
  }

  console.error(`[BooklyFlow] ${context}: no row returned`, details);
}

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

export type UpdateAppointmentInput = {
  serviceId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string | null;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  status?: AppointmentStatus;
  notes?: string | null;
  adminNote?: string | null;
};

function mapUpdateInput(input: UpdateAppointmentInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (input.serviceId !== undefined) payload.service_id = input.serviceId;
  if (input.customerName !== undefined) {
    payload.customer_name = input.customerName.trim();
  }
  if (input.customerPhone !== undefined) {
    payload.customer_phone = input.customerPhone.trim();
  }
  if (input.customerEmail !== undefined) {
    payload.customer_email = input.customerEmail?.trim() || null;
  }
  if (input.appointmentDate !== undefined) {
    payload.appointment_date = input.appointmentDate;
  }
  if (input.startTime !== undefined) payload.start_time = input.startTime;
  if (input.endTime !== undefined) payload.end_time = input.endTime;
  if (input.status !== undefined) payload.status = input.status;
  if (input.notes !== undefined) payload.notes = input.notes?.trim() || null;
  if (input.adminNote !== undefined) {
    payload.admin_note = input.adminNote?.trim() || null;
  }

  return payload;
}

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
    logSupabaseIssue("Failed to fetch appointments", error);
    return [];
  }

  return (data as AppointmentRow[]).map(mapAppointmentRow);
}

export async function getAppointmentById(
  supabase: SupabaseClient,
  id: string
): Promise<Appointment | null> {
  const normalizedId = id.trim();
  if (!isValidAppointmentId(normalizedId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", normalizedId)
    .maybeSingle();

  if (error || !data) {
    logSupabaseIssue("Failed to fetch appointment by id", error, {
      id: normalizedId,
    });
    return null;
  }

  return mapAppointmentRow(data as AppointmentRow);
}

export async function updateAppointmentSmsStatus(
  supabase: SupabaseClient,
  id: string,
  input: { sentAt?: string | null; error?: string | null }
): Promise<void> {
  const normalizedId = id.trim();
  if (!isValidAppointmentId(normalizedId)) {
    return;
  }

  const payload: Record<string, unknown> = {};

  if (input.sentAt !== undefined) {
    payload.sms_sent_at = input.sentAt;
  }

  if (input.error !== undefined) {
    payload.sms_error = input.error;
  }

  if (Object.keys(payload).length === 0) {
    return;
  }

  const { error } = await supabase
    .from("appointments")
    .update(payload)
    .eq("id", normalizedId);

  if (error) {
    logSupabaseIssue("Failed to update appointment SMS status", error, {
      id: normalizedId,
    });
  }
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
    .maybeSingle();

  if (error) {
    logSupabaseIssue("Failed to create appointment", error);
    return null;
  }

  if (!data) {
    logSupabaseIssue("No appointment returned after create", null);
    return null;
  }

  return mapAppointmentRow(data as AppointmentRow);
}

export async function updateAppointment(
  id: string,
  input: UpdateAppointmentInput
): Promise<Appointment | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const normalizedId = id.trim();
  if (!isValidAppointmentId(normalizedId)) {
    logSupabaseIssue("Invalid appointment id for update", null, { id: normalizedId });
    return null;
  }

  const payload = mapUpdateInput(input);
  if (Object.keys(payload).length === 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("appointments")
    .update(payload)
    .eq("id", normalizedId)
    .select("*")
    .maybeSingle();

  if (error) {
    logSupabaseIssue("Failed to update appointment", error, { id: normalizedId });
    return null;
  }

  if (!data) {
    logSupabaseIssue("No appointment returned after update", null, {
      id: normalizedId,
      hint: "Check Supabase RLS policies (004_appointments_and_business_settings_policies.sql).",
    });
    return null;
  }

  return mapAppointmentRow(data as AppointmentRow);
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<Appointment | null> {
  return updateAppointment(id, { status });
}
