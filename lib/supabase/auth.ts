import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type AuthResult = {
  user: User | null;
  error: string | null;
};

export function isAuthRequired(): boolean {
  return isSupabaseConfigured();
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { user: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}
