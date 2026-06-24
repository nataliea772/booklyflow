import type { Appointment, AppointmentStatus, Service } from "@/lib/types";
import { normalizeTimeString } from "@/lib/availability";

export type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  duration_minutes: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
};

export type AppointmentRow = {
  id: string;
  service_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  admin_note?: string | null;
  sms_sent_at?: string | null;
  sms_error?: string | null;
  created_at: string;
};

function isAppointmentStatus(value: string): value is AppointmentStatus {
  return (
    value === "pending" ||
    value === "confirmed" ||
    value === "cancelled" ||
    value === "completed"
  );
}

export function mapServiceRow(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    durationMinutes: row.duration_minutes,
    isActive: row.is_active,
    imageUrl: row.image_url ?? undefined,
  };
}

export function mapAppointmentRow(row: AppointmentRow): Appointment {
  const status = isAppointmentStatus(row.status) ? row.status : "pending";

  return {
    id: row.id,
    serviceId: row.service_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email ?? undefined,
    appointmentDate: row.appointment_date.slice(0, 10),
    startTime: normalizeTimeString(row.start_time),
    endTime: normalizeTimeString(row.end_time),
    status,
    notes: row.notes ?? undefined,
    adminNote: row.admin_note ?? undefined,
    createdAt: row.created_at,
    smsSentAt: row.sms_sent_at ?? undefined,
    smsError: row.sms_error ?? undefined,
  };
}
