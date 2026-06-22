import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { CustomerReview } from "@/lib/types";

type CustomerReviewRow = {
  id: string;
  appointment_id?: string | null;
  customer_name: string;
  rating: number;
  comment: string | null;
  is_visible: boolean;
  created_at: string;
};

export type SubmitCustomerReviewInput = {
  appointmentId: string;
  customerName: string;
  rating: number;
  comment?: string | null;
};

export type AdminUpdateReviewInput = {
  isVisible: boolean;
};

function normalizeRating(rating: number): number {
  return Math.min(5, Math.max(1, Math.round(rating)));
}

export function mapReviewRow(row: CustomerReviewRow): CustomerReview {
  return {
    id: row.id,
    appointmentId: row.appointment_id ?? undefined,
    customerName: row.customer_name,
    rating: normalizeRating(row.rating),
    comment: row.comment ?? undefined,
    isVisible: row.is_visible,
    createdAt: row.created_at,
  };
}

export async function getVisibleReviews(): Promise<CustomerReview[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("customer_reviews")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch visible reviews:", error.message);
    return [];
  }

  return (data as CustomerReviewRow[]).map(mapReviewRow);
}

export async function getAllReviews(): Promise<CustomerReview[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("customer_reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch reviews:", error.message);
    return [];
  }

  return (data as CustomerReviewRow[]).map(mapReviewRow);
}

export async function getReviewByAppointmentId(
  appointmentId: string
): Promise<CustomerReview | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("customer_reviews")
    .select("*")
    .eq("appointment_id", appointmentId.trim())
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapReviewRow(data as CustomerReviewRow);
}

export async function submitCustomerReview(
  input: SubmitCustomerReviewInput
): Promise<{ review: CustomerReview | null; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { review: null, error: "Reviews require Supabase configuration." };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { review: null, error: "Reviews require Supabase configuration." };
  }

  const { data, error } = await supabase
    .from("customer_reviews")
    .insert({
      appointment_id: input.appointmentId.trim(),
      customer_name: input.customerName.trim(),
      rating: normalizeRating(input.rating),
      comment: input.comment?.trim() || null,
      is_visible: true,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return { review: null, error: "duplicate" };
    }

    console.error("Failed to submit review:", error.message);
    return { review: null, error: "submit_failed" };
  }

  if (!data) {
    return { review: null, error: "submit_failed" };
  }

  return { review: mapReviewRow(data as CustomerReviewRow) };
}

export async function updateReviewVisibility(
  id: string,
  isVisible: boolean
): Promise<CustomerReview | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("customer_reviews")
    .update({ is_visible: isVisible })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to update review visibility:", error?.message);
    return null;
  }

  return mapReviewRow(data as CustomerReviewRow);
}

export async function deleteReview(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }

  const { error } = await supabase.from("customer_reviews").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete review:", error.message);
    return false;
  }

  return true;
}
