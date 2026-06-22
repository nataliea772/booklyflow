import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { BlockedTime } from "@/lib/types";

type BlockedTimeRow = {
  id: string;
  start_date?: string | null;
  end_date?: string | null;
  blocked_date?: string | null;
  start_time: string | null;
  end_time: string | null;
  is_full_day: boolean;
  reason: string | null;
  created_at: string;
};

function mapBlockedTimeRow(row: BlockedTimeRow): BlockedTime {
  const legacyDate = row.blocked_date ?? undefined;
  const startDate = row.start_date ?? legacyDate ?? "";
  const endDate = row.end_date ?? legacyDate ?? startDate;

  return {
    id: row.id,
    startDate,
    endDate,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    isFullDay: row.is_full_day,
    reason: row.reason ?? undefined,
    createdAt: row.created_at,
  };
}

export type BlockedTimeInput = {
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  isFullDay: boolean;
  reason?: string | null;
};

export type UpdateBlockedTimeInput = Partial<BlockedTimeInput>;

function mapInputToRow(input: BlockedTimeInput | UpdateBlockedTimeInput) {
  const row: Record<string, unknown> = {};

  if (input.startDate !== undefined) {
    row.start_date = input.startDate;
    row.blocked_date = input.startDate;
  }
  if (input.endDate !== undefined) {
    row.end_date = input.endDate;
  }
  if (input.isFullDay !== undefined) {
    row.is_full_day = input.isFullDay;
    if (input.isFullDay) {
      row.start_time = null;
      row.end_time = null;
    }
  }
  if (input.startTime !== undefined) {
    row.start_time = input.startTime;
  }
  if (input.endTime !== undefined) {
    row.end_time = input.endTime;
  }
  if (input.reason !== undefined) {
    row.reason = input.reason?.trim() || null;
  }

  return row;
}

export async function getBlockedTimes(): Promise<BlockedTime[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("blocked_times")
    .select("*")
    .order("start_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch blocked times:", error.message);
    return [];
  }

  return (data as BlockedTimeRow[]).map(mapBlockedTimeRow);
}

export async function createBlockedTime(
  input: BlockedTimeInput
): Promise<BlockedTime | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const payload = mapInputToRow(input);

  const { data, error } = await supabase
    .from("blocked_times")
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to create blocked time:", error?.message);
    return null;
  }

  return mapBlockedTimeRow(data as BlockedTimeRow);
}

export async function updateBlockedTime(
  id: string,
  input: UpdateBlockedTimeInput
): Promise<BlockedTime | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const payload = mapInputToRow(input);
  if (Object.keys(payload).length === 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("blocked_times")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to update blocked time:", error?.message);
    return null;
  }

  return mapBlockedTimeRow(data as BlockedTimeRow);
}

export async function deleteBlockedTime(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }

  const { error } = await supabase.from("blocked_times").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete blocked time:", error.message);
    return false;
  }

  return true;
}
