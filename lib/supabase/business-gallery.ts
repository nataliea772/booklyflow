import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { BusinessGalleryImage } from "@/lib/types";

type BusinessGalleryImageRow = {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
};

export type CreateGalleryImageInput = {
  imageUrl: string;
  altText?: string | null;
  displayOrder?: number;
  isVisible?: boolean;
};

export type UpdateGalleryImageInput = {
  altText?: string | null;
  displayOrder?: number;
  isVisible?: boolean;
};

export function mapGalleryImageRow(
  row: BusinessGalleryImageRow
): BusinessGalleryImage {
  return {
    id: row.id,
    imageUrl: row.image_url,
    altText: row.alt_text ?? undefined,
    displayOrder: row.display_order ?? 0,
    isVisible: row.is_visible,
    createdAt: row.created_at,
  };
}

export async function getVisibleGalleryImages(): Promise<BusinessGalleryImage[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("business_gallery_images")
    .select("*")
    .eq("is_visible", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch visible gallery images:", error.message);
    return [];
  }

  return (data as BusinessGalleryImageRow[]).map(mapGalleryImageRow);
}

export async function getAllGalleryImages(): Promise<BusinessGalleryImage[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("business_gallery_images")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch gallery images:", error.message);
    return [];
  }

  return (data as BusinessGalleryImageRow[]).map(mapGalleryImageRow);
}

export async function createGalleryImage(
  input: CreateGalleryImageInput
): Promise<{ image: BusinessGalleryImage | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { image: null, error: "Supabase is not configured." };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { image: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("business_gallery_images")
    .insert({
      image_url: input.imageUrl,
      alt_text: input.altText?.trim() || null,
      display_order: input.displayOrder ?? 0,
      is_visible: input.isVisible ?? true,
    })
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return {
      image: null,
      error: error?.message ?? "Failed to create gallery image.",
    };
  }

  return {
    image: mapGalleryImageRow(data as BusinessGalleryImageRow),
    error: null,
  };
}

export async function updateGalleryImage(
  id: string,
  input: UpdateGalleryImageInput
): Promise<{ image: BusinessGalleryImage | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { image: null, error: "Supabase is not configured." };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { image: null, error: "Supabase is not configured." };
  }

  const payload: Record<string, unknown> = {};

  if (input.altText !== undefined) {
    payload.alt_text = input.altText?.trim() || null;
  }
  if (input.displayOrder !== undefined) {
    payload.display_order = input.displayOrder;
  }
  if (input.isVisible !== undefined) {
    payload.is_visible = input.isVisible;
  }

  if (Object.keys(payload).length === 0) {
    return { image: null, error: "No changes provided." };
  }

  const { data, error } = await supabase
    .from("business_gallery_images")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return {
      image: null,
      error: error?.message ?? "Failed to update gallery image.",
    };
  }

  return {
    image: mapGalleryImageRow(data as BusinessGalleryImageRow),
    error: null,
  };
}

export async function deleteGalleryImage(
  id: string
): Promise<{ ok: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const { error } = await supabase
    .from("business_gallery_images")
    .delete()
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, error: null };
}
