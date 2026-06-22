import type { AppointmentStatus } from "./types";

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: "ממתין",
  confirmed: "מאושר",
  cancelled: "מבוטל",
  completed: "הושלם",
};

export function formatDisplayDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("he-IL", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatPrice(price: number): string {
  if (price === 0) {
    return "חינם";
  }

  return `₪${price.toLocaleString("he-IL")}`;
}

/** Always shows a numeric currency value (e.g. ₪0 for zero revenue). */
export function formatCurrency(amount: number): string {
  return `₪${amount.toLocaleString("he-IL")}`;
}
