"use client";

import { useCallback, useEffect, useState } from "react";
import { defaultBusinessSettings } from "@/lib/business-config";
import {
  getBusinessSettings,
  updateBusinessSettings,
  type UpdateBusinessSettingsInput,
} from "@/lib/supabase/business";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { BusinessSettings } from "@/lib/types";

export function useBusinessSettings() {
  const usesDatabase = isSupabaseConfigured();
  const [settings, setSettings] =
    useState<BusinessSettings>(defaultBusinessSettings);
  const [isReady, setIsReady] = useState(false);

  const refreshSettings = useCallback(async () => {
    if (!usesDatabase) {
      setSettings(defaultBusinessSettings);
      return;
    }

    setSettings(await getBusinessSettings());
  }, [usesDatabase]);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      if (!usesDatabase) {
        if (!cancelled) {
          setSettings(defaultBusinessSettings);
          setIsReady(true);
        }
        return;
      }

      const remoteSettings = await getBusinessSettings();
      if (!cancelled) {
        setSettings(remoteSettings);
        setIsReady(true);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [usesDatabase]);

  const saveSettings = useCallback(
    async (input: UpdateBusinessSettingsInput) => {
      if (!usesDatabase) {
        return {
          settings: null,
          error: "נדרש חיבור ל-Supabase לשמירת הגדרות.",
        };
      }

      const result = await updateBusinessSettings(input);
      if (result.settings) {
        setSettings(result.settings);
      }
      return result;
    },
    [usesDatabase]
  );

  return {
    settings,
    isReady,
    usesDatabase,
    refreshSettings,
    saveSettings,
  };
}
