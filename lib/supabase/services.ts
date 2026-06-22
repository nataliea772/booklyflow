import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { mapServiceRow, type ServiceRow } from "@/lib/supabase/mappers";
import {
  SERVICE_DELETE_ERROR_CODES,
  type DeleteServiceResult,
} from "@/lib/service-delete";
import type { Service } from "@/lib/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidServiceId(serviceId: string): boolean {
  return UUID_PATTERN.test(serviceId.trim());
}

function logSupabaseIssue(
  context: string,
  error: { message?: string; code?: string } | null,
  details?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (error) {
    console.error(`[BooklyFlow] ${context}:`, error.message, {
      code: error.code,
      ...details,
    });
    return;
  }

  console.error(`[BooklyFlow] ${context}: no row returned`, details);
}

export async function getServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    logSupabaseIssue("Failed to fetch services", error);
    return [];
  }

  return (data as ServiceRow[]).map(mapServiceRow);
}

export async function getServiceById(
  supabase: SupabaseClient,
  serviceId: string
): Promise<Service | null> {
  const normalizedId = serviceId.trim();
  if (!isValidServiceId(normalizedId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", normalizedId)
    .maybeSingle();

  if (error || !data) {
    logSupabaseIssue("Failed to fetch service by id", error, {
      serviceId: normalizedId,
    });
    return null;
  }

  return mapServiceRow(data as ServiceRow);
}

export type CreateServiceInput = {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
};

export type UpdateServiceInput = {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  isActive?: boolean;
  imageUrl?: string | null;
};

function mapUpdateInput(input: UpdateServiceInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) {
    payload.name = input.name.trim();
  }
  if (input.description !== undefined) {
    payload.description = input.description.trim();
  }
  if (input.price !== undefined) {
    payload.price = input.price;
  }
  if (input.durationMinutes !== undefined) {
    payload.duration_minutes = input.durationMinutes;
  }
  if (input.isActive !== undefined) {
    payload.is_active = input.isActive;
  }
  if (input.imageUrl !== undefined) {
    payload.image_url = input.imageUrl;
  }

  return payload;
}

export async function createService(
  input: CreateServiceInput
): Promise<Service | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("services")
    .insert({
      name: input.name.trim(),
      description: input.description.trim(),
      price: input.price,
      duration_minutes: input.durationMinutes,
      is_active: true,
      image_url: input.imageUrl ?? null,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    logSupabaseIssue("Failed to create service", error);
    return null;
  }

  if (!data) {
    logSupabaseIssue("No service returned after create", null);
    return null;
  }

  return mapServiceRow(data as ServiceRow);
}

export async function updateService(
  serviceId: string,
  input: UpdateServiceInput
): Promise<Service | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const normalizedId = serviceId.trim();
  if (!isValidServiceId(normalizedId)) {
    logSupabaseIssue("Invalid service id for update", null, {
      serviceId: normalizedId,
    });
    return null;
  }

  const payload = mapUpdateInput(input);
  if (Object.keys(payload).length === 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("services")
    .update(payload)
    .eq("id", normalizedId)
    .select("*")
    .maybeSingle();

  if (error) {
    logSupabaseIssue("Failed to update service", error, {
      serviceId: normalizedId,
    });
    return null;
  }

  if (!data) {
    logSupabaseIssue("No service returned after update", null, {
      serviceId: normalizedId,
      hint: "Check Supabase RLS policies (002_services_admin_policies.sql) and admin login.",
    });
    return null;
  }

  return mapServiceRow(data as ServiceRow);
}

export async function deactivateService(serviceId: string): Promise<Service | null> {
  return updateService(serviceId, { isActive: false });
}

export async function reactivateService(serviceId: string): Promise<Service | null> {
  return updateService(serviceId, { isActive: true });
}

export async function updateServiceImageUrl(
  serviceId: string,
  imageUrl: string | null
): Promise<Service | null> {
  return updateService(serviceId, { imageUrl });
}

export async function serviceHasAppointments(
  serviceId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }

  const normalizedId = serviceId.trim();
  if (!isValidServiceId(normalizedId)) {
    return false;
  }

  const { count, error } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("service_id", normalizedId);

  if (error) {
    logSupabaseIssue("Failed to check service appointments", error, {
      serviceId: normalizedId,
    });
    return true;
  }

  return (count ?? 0) > 0;
}

export async function deleteService(
  serviceId: string
): Promise<DeleteServiceResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: SERVICE_DELETE_ERROR_CODES.DELETE_FAILED };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: SERVICE_DELETE_ERROR_CODES.DELETE_FAILED };
  }

  const normalizedId = serviceId.trim();
  if (!isValidServiceId(normalizedId)) {
    logSupabaseIssue("Invalid service id for delete", null, {
      serviceId: normalizedId,
    });
    return { success: false, error: SERVICE_DELETE_ERROR_CODES.INVALID_ID };
  }

  if (await serviceHasAppointments(normalizedId)) {
    return {
      success: false,
      error: SERVICE_DELETE_ERROR_CODES.HAS_APPOINTMENTS,
    };
  }

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", normalizedId);

  if (error) {
    logSupabaseIssue("Failed to delete service", error, {
      serviceId: normalizedId,
      hint: "Check Supabase RLS policies (003_services_delete_policy.sql) and admin login.",
    });
    return { success: false, error: SERVICE_DELETE_ERROR_CODES.DELETE_FAILED };
  }

  return { success: true };
}
