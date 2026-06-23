import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchBusinessSettingsSafe } from "@/lib/supabase/fetch-business-settings";
import { normalizeBookingWindowDays } from "@/lib/booking-window";
import type { BusinessSettings, BusinessWorkingDay } from "@/lib/types";
import {
  deriveLegacyFromWorkingHours,
  normalizeBusinessSettings,
  parseWorkingHoursJson,
  workingHoursFromLegacy,
} from "@/lib/working-hours";

type BusinessSettingsRow = {
  id: string;
  business_name: string;
  start_hour: string;
  end_hour: string;
  buffer_minutes: number;
  booking_window_days?: number | null;
  working_days: number[];
  working_hours?: unknown;
  description?: string | null;
  phone?: string | null;
  whatsapp_phone?: string | null;
  location_url?: string | null;
  waze_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  email?: string | null;
  address?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  primary_color?: string | null;
};

export type UpdateBusinessSettingsInput = {
  businessName?: string;
  description?: string | null;
  phone?: string | null;
  whatsappPhone?: string | null;
  locationUrl?: string | null;
  wazeUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  email?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  primaryColor?: string | null;
  startHour?: string;
  endHour?: string;
  bufferMinutes?: number;
  bookingWindowDays?: number;
  workingDays?: number[];
  workingHours?: BusinessWorkingDay[];
};

function mapBusinessSettingsRow(row: BusinessSettingsRow): BusinessSettings {
  const workingHours =
    parseWorkingHoursJson(row.working_hours) ??
    workingHoursFromLegacy(row.working_days, row.start_hour, row.end_hour);

  return normalizeBusinessSettings({
    id: row.id,
    businessName: row.business_name,
    workingHours,
    startHour: row.start_hour,
    endHour: row.end_hour,
    bufferMinutes: row.buffer_minutes,
    bookingWindowDays: normalizeBookingWindowDays(row.booking_window_days),
    workingDays: row.working_days,
    description: row.description ?? undefined,
    phone: row.phone ?? undefined,
    whatsappPhone: row.whatsapp_phone ?? undefined,
    locationUrl: row.location_url ?? undefined,
    wazeUrl: row.waze_url ?? undefined,
    facebookUrl: row.facebook_url ?? undefined,
    instagramUrl: row.instagram_url ?? undefined,
    email: row.email ?? undefined,
    address: row.address ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    primaryColor: row.primary_color ?? undefined,
  });
}

function mapUpdateToRow(
  input: UpdateBusinessSettingsInput
): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (input.businessName !== undefined) {
    row.business_name = input.businessName.trim();
  }
  if (input.description !== undefined) {
    row.description = input.description?.trim() || null;
  }
  if (input.phone !== undefined) {
    row.phone = input.phone?.trim() || null;
  }
  if (input.whatsappPhone !== undefined) {
    row.whatsapp_phone = input.whatsappPhone?.trim() || null;
  }
  if (input.locationUrl !== undefined) {
    row.location_url = input.locationUrl?.trim() || null;
  }
  if (input.wazeUrl !== undefined) {
    row.waze_url = input.wazeUrl?.trim() || null;
  }
  if (input.facebookUrl !== undefined) {
    row.facebook_url = input.facebookUrl?.trim() || null;
  }
  if (input.instagramUrl !== undefined) {
    row.instagram_url = input.instagramUrl?.trim() || null;
  }
  if (input.email !== undefined) {
    row.email = input.email?.trim() || null;
  }
  if (input.address !== undefined) {
    row.address = input.address?.trim() || null;
  }
  if (input.logoUrl !== undefined) {
    row.logo_url = input.logoUrl || null;
  }
  if (input.coverImageUrl !== undefined) {
    row.cover_image_url = input.coverImageUrl || null;
  }
  if (input.primaryColor !== undefined) {
    row.primary_color = input.primaryColor?.trim() || null;
  }
  if (input.bufferMinutes !== undefined) {
    row.buffer_minutes = input.bufferMinutes;
  }
  if (input.bookingWindowDays !== undefined) {
    row.booking_window_days = normalizeBookingWindowDays(
      input.bookingWindowDays
    );
  }

  if (input.workingHours !== undefined) {
    const legacy = deriveLegacyFromWorkingHours(input.workingHours);
    row.working_hours = input.workingHours;
    row.working_days = legacy.workingDays;
    row.start_hour = legacy.startHour;
    row.end_hour = legacy.endHour;
  } else {
    if (input.startHour !== undefined) {
      row.start_hour = input.startHour;
    }
    if (input.endHour !== undefined) {
      row.end_hour = input.endHour;
    }
    if (input.workingDays !== undefined) {
      row.working_days = input.workingDays;
    }
  }

  return row;
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  return fetchBusinessSettingsSafe();
}

export async function updateBusinessSettings(
  input: UpdateBusinessSettingsInput
): Promise<{ settings: BusinessSettings | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { settings: null, error: "Supabase is not configured." };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { settings: null, error: "Supabase is not configured." };
  }

  try {
    const payload = mapUpdateToRow(input);
    if (Object.keys(payload).length === 0) {
      const current = await fetchBusinessSettingsSafe();
      return { settings: current, error: null };
    }

    const { data: existing, error: fetchError } = await supabase
      .from("business_settings")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fetchError || !existing?.id) {
      return {
        settings: null,
        error: fetchError?.message ?? "Business settings row not found.",
      };
    }

    const { data, error } = await supabase
      .from("business_settings")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();

    if (error) {
      return { settings: null, error: error.message };
    }

    if (!data) {
      return {
        settings: null,
        error: "Business settings row not found after update.",
      };
    }

    return {
      settings: mapBusinessSettingsRow(data as BusinessSettingsRow),
      error: null,
    };
  } catch (error) {
    console.error("Failed to update business settings:", error);
    return {
      settings: null,
      error:
        error instanceof Error ? error.message : "Failed to update settings.",
    };
  }
}
