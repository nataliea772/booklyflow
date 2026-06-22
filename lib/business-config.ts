import type { BusinessSettings } from "./types";
import {
  createDefaultWorkingHours,
  deriveLegacyFromWorkingHours,
} from "./working-hours";

/** Fallback when no business name is configured (public-facing only). */
export const PUBLIC_BUSINESS_FALLBACK_NAME = "העסק שלי";

const defaultWorkingHours = createDefaultWorkingHours();
const defaultLegacy = deriveLegacyFromWorkingHours(defaultWorkingHours);

export const defaultBusinessSettings: BusinessSettings = {
  businessName: PUBLIC_BUSINESS_FALLBACK_NAME,
  workingHours: defaultWorkingHours,
  bufferMinutes: 15,
  startHour: defaultLegacy.startHour,
  endHour: defaultLegacy.endHour,
  workingDays: defaultLegacy.workingDays,
};

const LEGACY_PRODUCT_NAMES = new Set(["booklyflow", "סטודיו booklyflow"]);

export function getPublicBusinessName(
  settings: Pick<BusinessSettings, "businessName">
): string {
  const name = settings.businessName?.trim();
  if (!name) {
    return PUBLIC_BUSINESS_FALLBACK_NAME;
  }

  if (LEGACY_PRODUCT_NAMES.has(name.toLowerCase())) {
    return PUBLIC_BUSINESS_FALLBACK_NAME;
  }

  return name;
}
