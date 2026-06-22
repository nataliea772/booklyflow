"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultBusinessSettings } from "@/lib/business-config";
import type { UpdateBusinessSettingsInput } from "@/lib/supabase/business";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchBusinessSettingsSafe } from "@/lib/supabase/fetch-business-settings";
import type { BusinessSettings } from "@/lib/types";

type BusinessSettingsContextValue = {
  settings: BusinessSettings;
  isReady: boolean;
  loadError: boolean;
  usesDatabase: boolean;
  refreshSettings: () => Promise<void>;
  saveSettings: (
    input: UpdateBusinessSettingsInput
  ) => Promise<{
    settings: BusinessSettings | null;
    error: string | null;
  }>;
};

const BusinessSettingsContext =
  createContext<BusinessSettingsContextValue | null>(null);

function BusinessSettingsProviderInner({ children }: { children: ReactNode }) {
  const usesDatabase = isSupabaseConfigured();
  const [settings, setSettings] =
    useState<BusinessSettings>(defaultBusinessSettings);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const refreshSettings = useCallback(async () => {
    if (!usesDatabase) {
      setSettings(defaultBusinessSettings);
      setLoadError(false);
      return;
    }

    const remoteSettings = await fetchBusinessSettingsSafe();
    setSettings(remoteSettings);
    setLoadError(false);
  }, [usesDatabase]);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        if (!usesDatabase) {
          if (!cancelled) {
            setSettings(defaultBusinessSettings);
            setLoadError(false);
            setIsReady(true);
          }
          return;
        }

        const remoteSettings = await fetchBusinessSettingsSafe();
        if (!cancelled) {
          setSettings(remoteSettings);
          setLoadError(false);
          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to load business settings:", error);
        if (!cancelled) {
          setSettings(defaultBusinessSettings);
          setLoadError(true);
          setIsReady(true);
        }
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

      try {
        const { updateBusinessSettings } = await import(
          "@/lib/supabase/business"
        );
        const result = await updateBusinessSettings(input);
        if (result.settings) {
          setSettings(result.settings);
          setLoadError(false);
        }
        return result;
      } catch (error) {
        console.error("Failed to save business settings:", error);
        return {
          settings: null,
          error:
            error instanceof Error
              ? error.message
              : "שגיאה בשמירת הגדרות העסק.",
        };
      }
    },
    [usesDatabase]
  );

  const value = useMemo(
    () => ({
      settings,
      isReady,
      loadError,
      usesDatabase,
      refreshSettings,
      saveSettings,
    }),
    [settings, isReady, loadError, usesDatabase, refreshSettings, saveSettings]
  );

  return (
    <BusinessSettingsContext.Provider value={value}>
      {children}
    </BusinessSettingsContext.Provider>
  );
}

export function BusinessSettingsProvider({ children }: { children: ReactNode }) {
  return <BusinessSettingsProviderInner>{children}</BusinessSettingsProviderInner>;
}

export function useBusinessSettings(): BusinessSettingsContextValue {
  const context = useContext(BusinessSettingsContext);
  if (!context) {
    throw new Error(
      "useBusinessSettings must be used within BusinessSettingsProvider"
    );
  }
  return context;
}
