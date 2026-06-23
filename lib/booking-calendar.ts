import { addDaysToDateString, getLocalDateString } from "@/lib/dates";

export const HEBREW_WEEKDAY_LABELS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

export const HEBREW_MONTH_NAMES = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

export type CalendarMonth = {
  year: number;
  /** 1–12 */
  month: number;
};

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function compareDateStrings(a: string, b: string): number {
  return a.localeCompare(b);
}

export function isBeforeMinDate(date: string, minDate: string): boolean {
  return compareDateStrings(date, minDate) < 0;
}

export function isAfterMaxDate(date: string, maxDate: string): boolean {
  return compareDateStrings(date, maxDate) > 0;
}

export function formatCalendarMonthTitle(year: number, month: number): string {
  const name = HEBREW_MONTH_NAMES[month - 1] ?? String(month);
  return `${name} ${year}`;
}

export function formatCalendarMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getMonthFromDateString(dateStr: string): CalendarMonth {
  const [year, month] = dateStr.split("-").map(Number);
  return { year, month };
}

/** Returns null for leading padding cells, YYYY-MM-DD for each day in the month. */
export function generateMonthDays(
  year: number,
  month: number
): (string | null)[] {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (string | null)[] = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(
      getLocalDateString(new Date(year, month - 1, day))
    );
  }

  return cells;
}

export function shiftCalendarMonth(
  { year, month }: CalendarMonth,
  delta: number
): CalendarMonth {
  const date = new Date(year, month - 1 + delta, 1);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

export type IsCalendarDateDisabledOptions = {
  minDate: string;
  maxDate: string;
  disabledDates?: string[];
  isDateDisabled?: (date: string) => boolean;
};

export function isCalendarDateDisabled(
  date: string,
  options: IsCalendarDateDisabledOptions
): boolean {
  if (isBeforeMinDate(date, options.minDate)) {
    return true;
  }

  if (isAfterMaxDate(date, options.maxDate)) {
    return true;
  }

  if (options.disabledDates?.includes(date)) {
    return true;
  }

  if (options.isDateDisabled?.(date)) {
    return true;
  }

  return false;
}

export function canNavigateCalendarMonth(
  visibleMonth: CalendarMonth,
  direction: -1 | 1,
  minDate: string,
  maxDate: string
): boolean {
  const next = shiftCalendarMonth(visibleMonth, direction);
  const monthStart = getLocalDateString(new Date(next.year, next.month - 1, 1));
  const monthEnd = getLocalDateString(new Date(next.year, next.month, 0));

  if (direction === -1) {
    return compareDateStrings(monthEnd, minDate) >= 0;
  }

  return compareDateStrings(monthStart, maxDate) <= 0;
}

export function getInitialCalendarMonth(
  selectedDate: string,
  minDate: string
): CalendarMonth {
  if (selectedDate) {
    return getMonthFromDateString(selectedDate);
  }

  return getMonthFromDateString(minDate);
}

export function isSameCalendarMonth(
  a: CalendarMonth,
  b: CalendarMonth
): boolean {
  return a.year === b.year && a.month === b.month;
}

/** Finds the month key (YYYY-MM) that contains the target date. */
export function getMonthKeyForDate(dateStr: string): string {
  const { year, month } = getMonthFromDateString(dateStr);
  return formatCalendarMonthKey(year, month);
}

export function addDaysToDate(dateStr: string, days: number): string {
  return addDaysToDateString(dateStr, days);
}
