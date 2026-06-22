import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isAuthRequired } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

function normalizeSupabaseUrl(url: string): string {
  return url
    .trim()
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/$/, "");
}

export function createServerSupabaseClient(
  accessToken?: string
): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export type AdminAuthResult =
  | {
      ok: true;
      supabase: SupabaseClient | null;
      accessToken?: string;
    }
  | {
      ok: false;
      error: string;
      status: number;
    };

export async function verifyAuthenticatedAdmin(
  request: Request
): Promise<AdminAuthResult> {
  if (!isAuthRequired()) {
    return {
      ok: true,
      supabase: createServerSupabaseClient(),
    };
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return {
      ok: false,
      error: "Unauthorized",
      status: 401,
    };
  }

  const accessToken = authorization.slice("Bearer ".length).trim();
  const supabase = createServerSupabaseClient(accessToken);

  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured.",
      status: 503,
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      error: "Unauthorized",
      status: 401,
    };
  }

  return {
    ok: true,
    supabase,
    accessToken,
  };
}
