import type { BlockedTime } from "./types";

export type BlockedTimeInput = {
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  isFullDay: boolean;
  reason?: string | null;
};

export type BlockedTimeValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function isDateInBlockedRange(
  date: string,
  blocked: BlockedTime
): boolean {
  return date >= blocked.startDate && date <= blocked.endDate;
}

export function isDateFullyBlocked(
  date: string,
  blockedTimes: BlockedTime[] = []
): boolean {
  return blockedTimes.some(
    (blocked) => isDateInBlockedRange(date, blocked) && blocked.isFullDay
  );
}

export function getBlockedTimesForDate(
  date: string,
  blockedTimes: BlockedTime[] = []
): BlockedTime[] {
  return blockedTimes.filter((blocked) => isDateInBlockedRange(date, blocked));
}

export function doSlotOverlapBlockedTime(
  slotStart: string,
  slotEnd: string,
  blocked: BlockedTime
): boolean {
  if (blocked.isFullDay) {
    return true;
  }

  if (!blocked.startTime || !blocked.endTime) {
    return false;
  }

  const slotStartMinutes = timeToMinutes(slotStart);
  const slotEndMinutes = timeToMinutes(slotEnd);
  const blockedStartMinutes = timeToMinutes(blocked.startTime);
  const blockedEndMinutes = timeToMinutes(blocked.endTime);

  return (
    slotStartMinutes < blockedEndMinutes && blockedStartMinutes < slotEndMinutes
  );
}

export function validateBlockedTimeInput(
  input: BlockedTimeInput
): BlockedTimeValidationResult {
  if (!input.startDate || !input.endDate) {
    return { valid: false, message: "יש לבחור תאריך התחלה וסיום." };
  }

  if (input.endDate < input.startDate) {
    return {
      valid: false,
      message: "תאריך הסיום לא יכול להיות לפני תאריך ההתחלה.",
    };
  }

  if (!input.isFullDay) {
    if (!input.startTime || !input.endTime) {
      return {
        valid: false,
        message: "יש להזין שעת התחלה ושעת סיום לחסימת שעות.",
      };
    }

    if (input.startTime >= input.endTime) {
      return {
        valid: false,
        message: "שעת הסיום חייבת להיות אחרי שעת ההתחלה.",
      };
    }
  }

  return { valid: true };
}

export function isSingleDayBlock(blocked: BlockedTime): boolean {
  return blocked.startDate === blocked.endDate;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
