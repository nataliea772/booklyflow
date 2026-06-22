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
