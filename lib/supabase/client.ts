import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  if (process.env.NEXT_PUBLIC_BOOKLYFLOW_DEMO_MODE === "true") {
    return false;
  }

  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

function normalizeSupabaseUrl(url: string): string {
  return url
    .trim()
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/$/, "");
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(
      normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
    );
  }

  return supabaseClient;
}
