import type { Appointment, AppointmentStatus, Service } from "@/lib/types";

export type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  duration_minutes: number;
  is_active: boolean;
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
  created_at: string;
};

function isAppointmentStatus(value: string): value is AppointmentStatus {
  return value === "pending" || value === "confirmed" || value === "cancelled";
}

export function mapServiceRow(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    durationMinutes: row.duration_minutes,
    isActive: row.is_active,
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
    appointmentDate: row.appointment_date,
    startTime: row.start_time,
    endTime: row.end_time,
    status,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}
