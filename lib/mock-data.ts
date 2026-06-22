import type {
  Appointment,
  AppointmentStatus,
  BusinessSettings,
  Service,
} from "./types";

export type { Appointment, AppointmentStatus, BusinessSettings, Service };

/** YYYY-MM-DD for mock appointments tied to "today". */
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export const businessSettings: BusinessSettings = {
  businessName: "BooklyFlow Studio",
  startHour: "09:00",
  endHour: "18:00",
  bufferMinutes: 15,
  workingDays: [0, 1, 2, 3, 4],
};

export const services: Service[] = [
  {
    id: "1",
    name: "Haircut & Style",
    description: "Professional cut with blow-dry styling",
    price: 55,
    durationMinutes: 45,
    isActive: true,
  },
  {
    id: "2",
    name: "Color Treatment",
    description: "Full color application with conditioning",
    price: 120,
    durationMinutes: 90,
    isActive: true,
  },
  {
    id: "3",
    name: "Manicure",
    description: "Classic manicure with polish of your choice",
    price: 35,
    durationMinutes: 30,
    isActive: true,
  },
  {
    id: "4",
    name: "Deep Tissue Massage",
    description: "60-minute therapeutic massage session",
    price: 85,
    durationMinutes: 60,
    isActive: true,
  },
  {
    id: "5",
    name: "Consultation",
    description: "Initial consultation for new clients",
    price: 0,
    durationMinutes: 20,
    isActive: true,
  },
];

const today = getTodayDateString();

export const appointments: Appointment[] = [
  {
    id: "1",
    serviceId: "1",
    customerName: "Sarah Johnson",
    customerPhone: "(555) 123-4567",
    appointmentDate: today,
    startTime: "10:00",
    endTime: "11:00",
    status: "confirmed",
    createdAt: `${today}T08:00:00.000Z`,
  },
  {
    id: "2",
    serviceId: "2",
    customerName: "Emily Davis",
    customerPhone: "(555) 345-6789",
    appointmentDate: today,
    startTime: "13:00",
    endTime: "14:30",
    status: "pending",
    createdAt: `${today}T09:30:00.000Z`,
  },
  {
    id: "3",
    serviceId: "4",
    customerName: "David Brown",
    customerPhone: "(555) 678-9012",
    appointmentDate: today,
    startTime: "16:00",
    endTime: "17:00",
    status: "cancelled",
    notes: "Rescheduled for next week",
    createdAt: `${today}T07:00:00.000Z`,
  },
  {
    id: "4",
    serviceId: "3",
    customerName: "James Wilson",
    customerPhone: "(555) 456-7890",
    appointmentDate: "2026-06-23",
    startTime: "11:00",
    endTime: "11:30",
    status: "pending",
    createdAt: "2026-06-22T10:00:00.000Z",
  },
  {
    id: "5",
    serviceId: "5",
    customerName: "Lisa Martinez",
    customerPhone: "(555) 567-8901",
    appointmentDate: "2026-06-23",
    startTime: "15:30",
    endTime: "15:50",
    status: "confirmed",
    createdAt: "2026-06-22T11:00:00.000Z",
  },
];

export const dashboardStats = {
  todayAppointments: 8,
  pending: 3,
  confirmed: 12,
  revenue: 1240,
};

export const features = [
  {
    title: "Easy Online Booking",
    description:
      "Let clients book appointments 24/7 — perfect for salons, clinics, and studios with busy schedules.",
    icon: "📅",
  },
  {
    title: "Smart Reminders",
    description:
      "Automated reminders reduce no-shows so your chairs, rooms, and time slots stay filled.",
    icon: "🔔",
  },
  {
    title: "Business Dashboard",
    description:
      "See today’s appointments, revenue, and pending bookings at a glance — no spreadsheets needed.",
    icon: "📊",
  },
  {
    title: "Service Management",
    description:
      "Set prices, durations, and descriptions for every service you offer in just a few clicks.",
    icon: "✨",
  },
];

export const businessTypes = [
  { label: "Beauty Studios", icon: "💅" },
  { label: "Clinics", icon: "🏥" },
  { label: "Personal Trainers", icon: "💪" },
  { label: "Private Teachers", icon: "📚" },
  { label: "Wellness Spas", icon: "🧘" },
  { label: "Consultants", icon: "💼" },
];
