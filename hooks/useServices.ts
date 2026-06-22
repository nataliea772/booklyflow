"use client";

import { useCallback, useEffect, useState } from "react";
import { services as fallbackServices } from "@/lib/mock-data";
import { SERVICE_DELETE_ERROR_CODES } from "@/lib/service-delete";
import { getMergedAppointments } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { Service } from "@/lib/types";

type ServiceInput = {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageFile?: File | null;
};

function replaceServiceInList(services: Service[], updated: Service): Service[] {
  return services.map((service) =>
    service.id === updated.id ? updated : service
  );
}

export type DeleteServiceOutcome =
  | { ok: true }
  | {
      ok: false;
      reason: "has_appointments" | "failed";
    };

export const SERVICE_DELETE_HAS_APPOINTMENTS_MESSAGE =
  "לא ניתן למחוק שירות שיש לו תורים קיימים. ניתן להשבית אותו במקום.";
export const SERVICE_DELETE_FAILED_MESSAGE =
  "לא הצלחנו למחוק את השירות. בדקי הרשאות Supabase ונסי שוב.";

export function useServices() {
  const usesDatabase = isSupabaseConfigured();
  const [services, setServices] = useState<Service[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const refreshServices = useCallback(async () => {
    if (!usesDatabase) {
      setServices(fallbackServices);
      setLoadError(false);
      return;
    }

    try {
      const { getServices } = await import("@/lib/supabase/services");
      setServices(await getServices());
      setLoadError(false);
    } catch (error) {
      console.error("Failed to refresh services:", error);
      setServices([]);
      setLoadError(true);
    }
  }, [usesDatabase]);

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        if (!usesDatabase) {
          if (!cancelled) {
            setServices(fallbackServices);
            setLoadError(false);
            setIsReady(true);
          }
          return;
        }

        const { getServices } = await import("@/lib/supabase/services");
        const remoteServices = await getServices();
        if (!cancelled) {
          setServices(remoteServices);
          setLoadError(false);
          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to load services:", error);
        if (!cancelled) {
          setServices([]);
          setLoadError(true);
          setIsReady(true);
        }
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, [usesDatabase]);

  const uploadServiceImageIfNeeded = useCallback(
    async (serviceId: string, imageFile?: File | null) => {
      if (!imageFile || !usesDatabase) {
        return null;
      }

      const { updateServiceImageUrl } = await import("@/lib/supabase/services");
      const { uploadServiceImage } = await import("@/lib/supabase/storage");
      const imageUrl = await uploadServiceImage(imageFile, serviceId);
      return updateServiceImageUrl(serviceId, imageUrl);
    },
    [usesDatabase]
  );

  const addService = useCallback(
    async (input: ServiceInput) => {
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

      try {
        const { createService } = await import("@/lib/supabase/services");

        const created = await createService(input);
        if (!created) {
          await refreshServices();
          return null;
        }

        try {
          const withImage = await uploadServiceImageIfNeeded(
            created.id,
            input.imageFile
          );
          const result = withImage ?? created;
          setServices((current) => [...current, result]);
          return result;
        } catch (error) {
          console.error("Failed to upload service image:", error);
          setServices((current) => [...current, created]);
          return created;
        }
      } catch (error) {
        console.error("Failed to add service:", error);
        return null;
      }
    },
    [usesDatabase, refreshServices, uploadServiceImageIfNeeded]
  );

  const updateService = useCallback(
    async (
      serviceId: string,
      input: ServiceInput & { isActive?: boolean }
    ) => {
      if (!usesDatabase) {
        let updated: Service | null = null;
        setServices((current) =>
          current.map((service) => {
            if (service.id !== serviceId) {
              return service;
            }
            updated = {
              ...service,
              name: input.name,
              description: input.description,
              price: input.price,
              durationMinutes: input.durationMinutes,
              isActive: input.isActive ?? service.isActive,
            };
            return updated;
          })
        );
        return updated;
      }

      try {
        const { updateService: updateRemoteService } = await import(
          "@/lib/supabase/services"
        );

        const updated = await updateRemoteService(serviceId, {
          name: input.name,
          description: input.description,
          price: input.price,
          durationMinutes: input.durationMinutes,
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        });

        if (!updated) {
          await refreshServices();
          return null;
        }

        try {
          const withImage = await uploadServiceImageIfNeeded(
            serviceId,
            input.imageFile
          );
          const result = withImage ?? updated;
          setServices((current) => replaceServiceInList(current, result));
          return result;
        } catch (error) {
          console.error("Failed to upload service image:", error);
          setServices((current) => replaceServiceInList(current, updated));
          return updated;
        }
      } catch (error) {
        console.error("Failed to update service:", error);
        return null;
      }
    },
    [usesDatabase, refreshServices, uploadServiceImageIfNeeded]
  );

  const deactivateService = useCallback(
    async (serviceId: string) => {
      if (!usesDatabase) {
        let updated: Service | null = null;
        setServices((current) =>
          current.map((service) => {
            if (service.id !== serviceId) {
              return service;
            }
            updated = { ...service, isActive: false };
            return updated;
          })
        );
        return updated;
      }

      try {
        const { deactivateService: deactivateRemoteService } = await import(
          "@/lib/supabase/services"
        );
        const updated = await deactivateRemoteService(serviceId);
        if (!updated) {
          await refreshServices();
          return null;
        }
        setServices((current) => replaceServiceInList(current, updated));
        return updated;
      } catch (error) {
        console.error("Failed to deactivate service:", error);
        return null;
      }
    },
    [usesDatabase, refreshServices]
  );

  const reactivateService = useCallback(
    async (serviceId: string) => {
      if (!usesDatabase) {
        let updated: Service | null = null;
        setServices((current) =>
          current.map((service) => {
            if (service.id !== serviceId) {
              return service;
            }
            updated = { ...service, isActive: true };
            return updated;
          })
        );
        return updated;
      }

      try {
        const { reactivateService: reactivateRemoteService } = await import(
          "@/lib/supabase/services"
        );
        const updated = await reactivateRemoteService(serviceId);
        if (!updated) {
          await refreshServices();
          return null;
        }
        setServices((current) => replaceServiceInList(current, updated));
        return updated;
      } catch (error) {
        console.error("Failed to reactivate service:", error);
        return null;
      }
    },
    [usesDatabase, refreshServices]
  );

  const deleteService = useCallback(
    async (serviceId: string): Promise<DeleteServiceOutcome> => {
      if (!usesDatabase) {
        const hasAppointments = getMergedAppointments().some(
          (appointment) => appointment.serviceId === serviceId
        );

        if (hasAppointments) {
          return { ok: false, reason: "has_appointments" };
        }

        setServices((current) =>
          current.filter((service) => service.id !== serviceId)
        );

        return { ok: true };
      }

      try {
        const { deleteService: deleteRemoteService } = await import(
          "@/lib/supabase/services"
        );
        const result = await deleteRemoteService(serviceId);

        if (result.success) {
          setServices((current) =>
            current.filter((service) => service.id !== serviceId)
          );
          return { ok: true };
        }

        if (result.error === SERVICE_DELETE_ERROR_CODES.HAS_APPOINTMENTS) {
          return { ok: false, reason: "has_appointments" };
        }

        await refreshServices();
        return { ok: false, reason: "failed" };
      } catch (error) {
        console.error("Failed to delete service:", error);
        return { ok: false, reason: "failed" };
      }
    },
    [usesDatabase, refreshServices]
  );

  return {
    services,
    isReady,
    loadError,
    usesDatabase,
    refreshServices,
    addService,
    updateService,
    deactivateService,
    reactivateService,
    deleteService,
  };
}
