"use client";

import { useCallback, useEffect, useState } from "react";
import { services as mockServices } from "@/lib/mock-data";
import { getServices } from "@/lib/supabase/services";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { Service } from "@/lib/types";

export function useServices() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [isReady, setIsReady] = useState(false);

  const refreshServices = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setServices(mockServices);
      return;
    }

    const remoteServices = await getServices();
    if (remoteServices.length > 0) {
      setServices(remoteServices);
    } else {
      setServices(mockServices);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      if (!isSupabaseConfigured()) {
        if (!cancelled) {
          setServices(mockServices);
          setIsReady(true);
        }
        return;
      }

      const remoteServices = await getServices();
      if (!cancelled) {
        setServices(remoteServices.length > 0 ? remoteServices : mockServices);
        setIsReady(true);
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  return { services, isReady, refreshServices };
}
