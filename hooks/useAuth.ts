"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import {
  getCurrentUser,
  isAuthRequired,
  signInWithEmail,
  signOut,
} from "@/lib/supabase/auth";
import { getSupabaseClient } from "@/lib/supabase/client";

export function useAuth() {
  const authRequired = isAuthRequired();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(authRequired);

  useEffect(() => {
    if (!authRequired) {
      setUser(null);
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadUser() {
      const currentUser = await getCurrentUser();
      if (!cancelled) {
        setUser(currentUser);
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [authRequired]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);

    if (result.user) {
      setUser(result.user);
    }

    return result;
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const isAuthenticated = !authRequired || Boolean(user);

  return {
    user,
    loading,
    authRequired,
    isAuthenticated,
    login,
    logout,
  };
}
