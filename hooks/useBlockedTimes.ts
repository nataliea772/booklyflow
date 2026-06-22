"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { BlockedTime } from "@/lib/types";
import type {
  BlockedTimeInput,
  UpdateBlockedTimeInput,
} from "@/lib/supabase/blocked-times";

export function useBlockedTimes() {
  const usesDatabase = isSupabaseConfigured();
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refreshBlockedTimes = useCallback(async () => {
    if (!usesDatabase) {
      setBlockedTimes([]);
      return;
    }

    const { getBlockedTimes } = await import("@/lib/supabase/blocked-times");
    setBlockedTimes(await getBlockedTimes());
  }, [usesDatabase]);

  useEffect(() => {
    let cancelled = false;

    async function loadBlockedTimes() {
      try {
        if (!usesDatabase) {
          if (!cancelled) {
            setBlockedTimes([]);
            setIsReady(true);
          }
          return;
        }

        const { getBlockedTimes } = await import("@/lib/supabase/blocked-times");
        const remote = await getBlockedTimes();
        if (!cancelled) {
          setBlockedTimes(remote);
          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to load blocked times:", error);
        if (!cancelled) {
          setBlockedTimes([]);
          setIsReady(true);
        }
      }
    }

    loadBlockedTimes();

    return () => {
      cancelled = true;
    };
  }, [usesDatabase]);

  const addBlockedTime = useCallback(
    async (input: BlockedTimeInput) => {
      if (!usesDatabase) {
        const local: BlockedTime = {
          id: `local-${Date.now()}`,
          startDate: input.startDate,
          endDate: input.endDate,
          startTime: input.startTime ?? undefined,
          endTime: input.endTime ?? undefined,
          isFullDay: input.isFullDay,
          reason: input.reason ?? undefined,
          createdAt: new Date().toISOString(),
        };
        setBlockedTimes((current) => [...current, local]);
        return local;
      }

      const { createBlockedTime } = await import("@/lib/supabase/blocked-times");
      const created = await createBlockedTime(input);
      if (created) {
        setBlockedTimes((current) => [...current, created]);
        return created;
      }

      await refreshBlockedTimes();
      return null;
    },
    [usesDatabase, refreshBlockedTimes]
  );

  const updateBlockedTime = useCallback(
    async (id: string, input: UpdateBlockedTimeInput) => {
      if (!usesDatabase) {
        let updated: BlockedTime | null = null;
        setBlockedTimes((current) =>
          current.map((item) => {
            if (item.id !== id) {
              return item;
            }
            updated = {
              ...item,
              ...(input.startDate !== undefined
                ? { startDate: input.startDate }
                : {}),
              ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
              ...(input.isFullDay !== undefined
                ? { isFullDay: input.isFullDay }
                : {}),
              ...(input.startTime !== undefined
                ? { startTime: input.startTime ?? undefined }
                : {}),
              ...(input.endTime !== undefined
                ? { endTime: input.endTime ?? undefined }
                : {}),
              ...(input.reason !== undefined
                ? { reason: input.reason ?? undefined }
                : {}),
            };
            return updated;
          })
        );
        return updated;
      }

      const { updateBlockedTime: updateRemote } = await import(
        "@/lib/supabase/blocked-times"
      );
      const updated = await updateRemote(id, input);
      if (updated) {
        setBlockedTimes((current) =>
          current.map((item) => (item.id === id ? updated : item))
        );
        return updated;
      }

      await refreshBlockedTimes();
      return null;
    },
    [usesDatabase, refreshBlockedTimes]
  );

  const removeBlockedTime = useCallback(
    async (id: string) => {
      if (!usesDatabase) {
        setBlockedTimes((current) => current.filter((item) => item.id !== id));
        return true;
      }

      const { deleteBlockedTime } = await import("@/lib/supabase/blocked-times");
      const success = await deleteBlockedTime(id);
      if (success) {
        setBlockedTimes((current) => current.filter((item) => item.id !== id));
        return true;
      }

      await refreshBlockedTimes();
      return false;
    },
    [usesDatabase, refreshBlockedTimes]
  );

  return {
    blockedTimes,
    isReady,
    usesDatabase,
    refreshBlockedTimes,
    addBlockedTime,
    updateBlockedTime,
    removeBlockedTime,
  };
}
