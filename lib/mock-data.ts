import type {
  Appointment,
  AppointmentStatus,
  Service,
} from "./types";
import { getTodayDateString } from "./dates";

export type { Appointment, AppointmentStatus, Service };

export { getTodayDateString };

export const services: Service[] = [
  {
    id: "1",
    name: "תספורת ועיצוב",
    description: "תספורת מקצועית עם ייבוש ועיצוב",
    price: 55,
    durationMinutes: 45,
    isActive: true,
  },
  {
    id: "2",
    name: "טיפול צבע",
    description: "צביעה מלאה עם טיפול לשיער",
    price: 120,
    durationMinutes: 90,
    isActive: true,
  },
  {
    id: "3",
    name: "מניקור",
    description: "מניקור קלאסי עם לק לבחירתך",
    price: 35,
    durationMinutes: 30,
    isActive: true,
  },
  {
    id: "4",
    name: "עיסוי רקמות עמוק",
    description: "עיסוי טיפולי של 60 דקות",
    price: 85,
    durationMinutes: 60,
    isActive: true,
  },
  {
    id: "5",
    name: "פגישת היכרות",
    description: "פגישת ייעוץ ראשונה ללקוחות חדשים",
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
    customerName: "שרה כהן",
    customerPhone: "050-123-4567",
    appointmentDate: today,
    startTime: "10:00",
    endTime: "11:00",
    status: "confirmed",
    createdAt: `${today}T08:00:00.000Z`,
  },
  {
    id: "2",
    serviceId: "2",
    customerName: "מיכל לוי",
    customerPhone: "050-345-6789",
    appointmentDate: today,
    startTime: "13:00",
    endTime: "14:30",
    status: "pending",
    createdAt: `${today}T09:30:00.000Z`,
  },
  {
    id: "3",
    serviceId: "4",
    customerName: "דוד בר",
    customerPhone: "050-678-9012",
    appointmentDate: today,
    startTime: "16:00",
    endTime: "17:00",
    status: "cancelled",
    notes: "נדחה לשבוע הבא",
    createdAt: `${today}T07:00:00.000Z`,
  },
  {
    id: "4",
    serviceId: "3",
    customerName: "יוסי אברהם",
    customerPhone: "050-456-7890",
    appointmentDate: "2026-06-23",
    startTime: "11:00",
    endTime: "11:30",
    status: "pending",
    createdAt: "2026-06-22T10:00:00.000Z",
  },
  {
    id: "5",
    serviceId: "5",
    customerName: "ליזה מרטינז",
    customerPhone: "050-567-8901",
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

/** @deprecated Use lib/marketing.ts for production UI content */
export const features = [
  {
    title: "הזמנת תור בקלות",
    description:
      "לקוחות יכולים להזמין תורים 24/7 — מושלם לסטודיואים, קליניקות ועסקים עם לוח זמנים עמוס.",
    icon: "📅",
  },
  {
    title: "תזכורות חכמות",
    description:
      "תזכורות אוטומטיות מפחיתות אי-הגעות ושומרות על לוח הזמנים מלא.",
    icon: "🔔",
  },
  {
    title: "לוח בקרה עסקי",
    description:
      "צפייה בתורים של היום, הכנסות ותורים ממתינים במבט אחד — בלי גיליונות אלקטרוניים.",
    icon: "📊",
  },
  {
    title: "ניהול שירותים",
    description:
      "הגדרת מחירים, משך זמן ותיאורים לכל שירות בכמה לחיצות.",
    icon: "✨",
  },
];

export const businessTypes = [
  { label: "סטודיואים ליופי", icon: "💅" },
  { label: "קליניקות", icon: "🏥" },
  { label: "מאמנים אישיים", icon: "💪" },
  { label: "מורים פרטיים", icon: "📚" },
  { label: "ספא ובריאות", icon: "🧘" },
  { label: "יועצים", icon: "💼" },
];
