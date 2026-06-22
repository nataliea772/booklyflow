import { defaultBusinessSettings } from "@/lib/business-config";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { BusinessSettings } from "@/lib/types";

type BusinessSettingsRow = {
  id: string;
  business_name: string;
  start_hour: string;
  end_hour: string;
  buffer_minutes: number;
  working_days: number[];
  description?: string | null;
  phone?: string | null;
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
  email?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  primaryColor?: string | null;
  startHour?: string;
  endHour?: string;
  bufferMinutes?: number;
  workingDays?: number[];
};

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
  return {
    id: typeof row.id === "string" ? row.id : undefined,
    businessName:
      typeof row.business_name === "string"
        ? row.business_name
        : defaultBusinessSettings.businessName,
    startHour:
      typeof row.start_hour === "string"
        ? row.start_hour
        : defaultBusinessSettings.startHour,
    endHour:
      typeof row.end_hour === "string"
        ? row.end_hour
        : defaultBusinessSettings.endHour,
    bufferMinutes:
      typeof row.buffer_minutes === "number"
        ? row.buffer_minutes
        : defaultBusinessSettings.bufferMinutes,
    workingDays: Array.isArray(row.working_days)
      ? (row.working_days as number[])
      : defaultBusinessSettings.workingDays,
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
}

function mapBusinessSettingsRow(row: BusinessSettingsRow): BusinessSettings {
  return mapPartialRow(row as unknown as Record<string, unknown>);
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
  if (input.startHour !== undefined) {
    row.start_hour = input.startHour;
  }
  if (input.endHour !== undefined) {
    row.end_hour = input.endHour;
  }
  if (input.bufferMinutes !== undefined) {
    row.buffer_minutes = input.bufferMinutes;
  }
  if (input.workingDays !== undefined) {
    row.working_days = input.workingDays;
  }

  return row;
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  if (!isSupabaseConfigured()) {
    return defaultBusinessSettings;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return defaultBusinessSettings;
  }

  const fullSelect = `${CORE_COLUMNS}, ${BRANDING_COLUMNS}`;
  let { data, error } = await supabase
    .from("business_settings")
    .select(fullSelect)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

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

  const payload = mapUpdateToRow(input);
  if (Object.keys(payload).length === 0) {
    const current = await getBusinessSettings();
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
    .single();

  if (error) {
    return { settings: null, error: error.message };
  }

  return {
    settings: mapBusinessSettingsRow(data as BusinessSettingsRow),
    error: null,
  };
}
