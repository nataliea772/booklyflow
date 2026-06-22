import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const STORAGE_BUCKET = "booklyflow-assets";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function assertImageFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("סוג קובץ לא נתמך. השתמשו ב-JPG, PNG, WebP או GIF.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("הקובץ גדול מדי. גודל מקסימלי: 5MB.");
  }
}

function getFileExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

function buildUniquePath(prefix: string, file: File): string {
  const ext = getFileExtension(file);
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}/${id}.${ext}`;
}

function getPublicUrl(path: string): string {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadImage(path: string, file: File): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  assertImageFile(file);

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(error.message);
  }

  return getPublicUrl(path);
}

export function getStoragePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(idx + marker.length));
}

export async function uploadBusinessImage(
  file: File,
  type: "logo" | "cover"
): Promise<string> {
  const path = buildUniquePath(`business/${type}`, file);
  return uploadImage(path, file);
}

export async function uploadServiceImage(
  file: File,
  serviceId: string
): Promise<string> {
  const path = buildUniquePath(`services/${serviceId}`, file);
  return uploadImage(path, file);
}

export async function deleteImageByUrl(url: string): Promise<void> {
  if (!isSupabaseConfigured() || !url.trim()) {
    return;
  }

  const path = getStoragePathFromPublicUrl(url);
  if (!path) {
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) {
    console.error("Failed to delete image:", error.message);
  }
}
