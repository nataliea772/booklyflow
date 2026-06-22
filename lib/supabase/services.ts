import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { mapServiceRow, type ServiceRow } from "@/lib/supabase/mappers";
import type { Service } from "@/lib/types";

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
    console.error("Failed to fetch services:", error.message);
    return [];
  }

  return (data as ServiceRow[]).map(mapServiceRow);
}

export type CreateServiceInput = {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
};

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
    .single();

  if (error) {
    console.error("Failed to create service:", error.message);
    return null;
  }

  return mapServiceRow(data as ServiceRow);
}

export async function updateServiceImageUrl(
  serviceId: string,
  imageUrl: string | null
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
    .update({ image_url: imageUrl })
    .eq("id", serviceId)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update service image:", error.message);
    return null;
  }

  return mapServiceRow(data as ServiceRow);
}
