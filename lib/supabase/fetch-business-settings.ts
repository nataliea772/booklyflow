import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultBusinessSettings } from "@/lib/business-config";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { BusinessSettings } from "@/lib/types";
import {
  normalizeBusinessSettings,
  parseWorkingHoursJson,
  workingHoursFromLegacy,
} from "@/lib/working-hours";

function isMissingColumnError(error: { message?: string; code?: string }): boolean {
  return (
    error.code === "42703" ||
    Boolean(error.message?.includes("does not exist"))
  );
}

const CORE_COLUMNS =
  "id, business_name, start_hour, end_hour, buffer_minutes, working_days";

const BRANDING_COLUMNS =
  "description, phone, email, address, logo_url, cover_image_url, primary_color";

function mapPartialRow(row: Record<string, unknown>): BusinessSettings {
  const startHour =
    typeof row.start_hour === "string"
      ? row.start_hour
      : defaultBusinessSettings.startHour;
  const endHour =
    typeof row.end_hour === "string"
      ? row.end_hour
      : defaultBusinessSettings.endHour;
  const workingDays = Array.isArray(row.working_days)
    ? (row.working_days as number[])
    : defaultBusinessSettings.workingDays;

  const workingHours =
    parseWorkingHoursJson(row.working_hours) ??
    workingHoursFromLegacy(workingDays, startHour, endHour);

  const settings: BusinessSettings = {
    id: typeof row.id === "string" ? row.id : undefined,
    businessName:
      typeof row.business_name === "string"
        ? row.business_name
        : defaultBusinessSettings.businessName,
    workingHours,
    startHour,
    endHour,
    bufferMinutes:
      typeof row.buffer_minutes === "number"
        ? row.buffer_minutes
        : defaultBusinessSettings.bufferMinutes,
    workingDays,
    description:
      typeof row.description === "string" ? row.description : undefined,
    phone: typeof row.phone === "string" ? row.phone : undefined,
    email: typeof row.email === "string" ? row.email : undefined,
    address: typeof row.address === "string" ? row.address : undefined,
    logoUrl: typeof row.logo_url === "string" ? row.logo_url : undefined,
    coverImageUrl:
      typeof row.cover_image_url === "string" ? row.cover_image_url : undefined,
    primaryColor:
      typeof row.primary_color === "string" ? row.primary_color : undefined,
  };

  return normalizeBusinessSettings(settings);
}

async function fetchBusinessSettingsFromClient(
  supabase: SupabaseClient
): Promise<BusinessSettings> {
  const fullSelect = `${CORE_COLUMNS}, working_hours, ${BRANDING_COLUMNS}`;
  let { data, error } = await supabase
    .from("business_settings")
    .select(fullSelect)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error && isMissingColumnError(error)) {
    ({ data, error } = await supabase
      .from("business_settings")
      .select(`${CORE_COLUMNS}, ${BRANDING_COLUMNS}`)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle());
  }

  if (error && isMissingColumnError(error)) {
    ({ data, error } = await supabase
      .from("business_settings")
      .select(CORE_COLUMNS)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle());
  }

  if (error || !data) {
    return defaultBusinessSettings;
  }

  return mapPartialRow(data as Record<string, unknown>);
}

/** Safe read used by public pages — never throws. */
export async function fetchBusinessSettingsSafe(
  supabaseClient?: SupabaseClient | null
): Promise<BusinessSettings> {
  try {
    if (!isSupabaseConfigured()) {
      return defaultBusinessSettings;
    }

    const supabase = supabaseClient ?? getSupabaseClient();
    if (!supabase) {
      return defaultBusinessSettings;
    }

    return await fetchBusinessSettingsFromClient(supabase);
  } catch (error) {
    console.error("Failed to load business settings:", error);
    return defaultBusinessSettings;
  }
}
