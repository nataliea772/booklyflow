import type { BusinessSettings } from "./types";

/** Fallback when no business name is configured (public-facing only). */
export const PUBLIC_BUSINESS_FALLBACK_NAME = "העסק שלי";

export const defaultBusinessSettings: BusinessSettings = {
  businessName: PUBLIC_BUSINESS_FALLBACK_NAME,
  startHour: "09:00",
  endHour: "18:00",
  bufferMinutes: 15,
  workingDays: [0, 1, 2, 3, 4],
};

const LEGACY_PRODUCT_NAMES = new Set(["booklyflow", "סטודיו booklyflow"]);

export function getPublicBusinessName(settings: BusinessSettings): string {
  const name = settings.businessName?.trim();
  if (!name) {
    return PUBLIC_BUSINESS_FALLBACK_NAME;
  }

  if (LEGACY_PRODUCT_NAMES.has(name.toLowerCase())) {
    return PUBLIC_BUSINESS_FALLBACK_NAME;
  }

  return name;
}
