"use client";

import { useCallback, useEffect, useState } from "react";
import { services as fallbackServices } from "@/lib/mock-data";
import {
  createService,
  getServices,
  updateServiceImageUrl,
} from "@/lib/supabase/services";
import { uploadServiceImage } from "@/lib/supabase/storage";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { Service } from "@/lib/types";

export function useServices() {
  const usesDatabase = isSupabaseConfigured();
  const [services, setServices] = useState<Service[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refreshServices = useCallback(async () => {
    if (!usesDatabase) {
      setServices(fallbackServices);
      return;
    }

    setServices(await getServices());
  }, [usesDatabase]);

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      if (!usesDatabase) {
        if (!cancelled) {
          setServices(fallbackServices);
          setIsReady(true);
        }
        return;
      }

      const remoteServices = await getServices();
      if (!cancelled) {
        setServices(remoteServices);
        setIsReady(true);
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, [usesDatabase]);

  const addService = useCallback(
    async (input: {
      name: string;
      description: string;
      price: number;
      durationMinutes: number;
      imageFile?: File | null;
    }) => {
      if (!usesDatabase) {
        const localService: Service = {
          id: String(Date.now()),
          name: input.name,
          description: input.description,
          price: input.price,
          durationMinutes: input.durationMinutes,
          isActive: true,
        };
        setServices((current) => [...current, localService]);
        return localService;
      }

      const created = await createService(input);
      if (!created) {
        await refreshServices();
        return null;
      }

      if (input.imageFile) {
        try {
          const imageUrl = await uploadServiceImage(
            input.imageFile,
            created.id
          );
          const updated = await updateServiceImageUrl(created.id, imageUrl);
          if (updated) {
            setServices((current) => [...current, updated]);
            return updated;
          }
        } catch (error) {
          console.error("Failed to upload service image:", error);
          setServices((current) => [...current, created]);
          return created;
        }
      }

      setServices((current) => [...current, created]);
      return created;
    },
    [usesDatabase, refreshServices]
  );

  return {
    services,
    isReady,
    usesDatabase,
    refreshServices,
    addService,
  };
}
