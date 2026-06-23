"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import {
  createGalleryImage,
  deleteGalleryImage,
  getAllGalleryImages,
  updateGalleryImage,
} from "@/lib/supabase/business-gallery";
import { deleteImageByUrl, uploadGalleryImage } from "@/lib/supabase/storage";
import type { BusinessGalleryImage } from "@/lib/types";

export default function BusinessGalleryManager() {
  const [images, setImages] = useState<BusinessGalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadImages() {
    setIsLoading(true);
    const galleryImages = await getAllGalleryImages();
    setImages(galleryImages);
    setIsLoading(false);
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setActionError(null);
    setIsUploading(true);

    try {
      const imageUrl = await uploadGalleryImage(file);
      const nextOrder =
        images.length > 0
          ? Math.max(...images.map((image) => image.displayOrder)) + 1
          : 0;

      const result = await createGalleryImage({
        imageUrl,
        displayOrder: nextOrder,
        isVisible: true,
      });

      if (result.error || !result.image) {
        await deleteImageByUrl(imageUrl);
        setActionError("לא הצלחנו לשמור את התמונה");
        return;
      }

      setImages((current) => [...current, result.image!]);
    } catch {
      setActionError("לא הצלחנו להעלות את התמונה");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave(image: BusinessGalleryImage) {
    setActionError(null);
    setSavingId(image.id);

    const result = await updateGalleryImage(image.id, {
      altText: image.altText ?? null,
      displayOrder: image.displayOrder,
      isVisible: image.isVisible,
    });

    setSavingId(null);

    if (result.error || !result.image) {
      setActionError("לא הצלחנו לעדכן את התמונה");
      return;
    }

    setImages((current) =>
      current.map((item) => (item.id === image.id ? result.image! : item))
    );
  }

  async function handleDelete(image: BusinessGalleryImage) {
    if (!window.confirm("האם למחוק את התמונה?")) {
      return;
    }

    setActionError(null);
    setDeletingId(image.id);

    const result = await deleteGalleryImage(image.id);

    if (!result.ok) {
      setDeletingId(null);
      setActionError("לא הצלחנו למחוק את התמונה");
      return;
    }

    await deleteImageByUrl(image.imageUrl);
    setImages((current) => current.filter((item) => item.id !== image.id));
    setDeletingId(null);
  }

  function updateLocalImage(
    id: string,
    patch: Partial<Pick<BusinessGalleryImage, "altText" | "displayOrder" | "isVisible">>
  ) {
    setImages((current) =>
      current.map((image) =>
        image.id === id ? { ...image, ...patch } : image
      )
    );
  }

  return (
    <div className="space-y-4 border-t border-black/8 pt-8" data-testid="business-gallery-manager">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-charcoal">תמונות מהעסק</h3>
          <p className="mt-1 text-sm text-muted">
            תמונות שיוצגו בדף הבית הציבורי (עד 6 תמונות גלויות).
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
            data-testid="gallery-upload-input"
          />
          <Button
            type="button"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            data-testid="gallery-upload-button"
          >
            {isUploading ? "מעלה…" : "+ הוספת תמונה"}
          </Button>
        </div>
      </div>

      {actionError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {actionError}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted">טוען תמונות…</p>
      ) : images.length === 0 ? (
        <p className="rounded-2xl border border-black/10 bg-white px-4 py-6 text-center text-sm text-muted">
          עדיין לא נוספו תמונות מהעסק
        </p>
      ) : (
        <ul className="space-y-4">
          {images.map((image) => (
            <li
              key={image.id}
              className="rounded-2xl border border-black/10 bg-white p-4"
              data-testid={`gallery-admin-row-${image.id}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-32">
                  <Image
                    src={image.imageUrl}
                    alt={image.altText || "תמונת גלריה"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold text-muted">
                      תיאור תמונה
                    </label>
                    <input
                      type="text"
                      value={image.altText ?? ""}
                      onChange={(event) =>
                        updateLocalImage(image.id, {
                          altText: event.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="לדוגמה: הסטודיו שלנו"
                      data-testid={`gallery-alt-${image.id}`}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-muted">
                      סדר תצוגה
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={image.displayOrder}
                      onChange={(event) =>
                        updateLocalImage(image.id, {
                          displayOrder: Number(event.target.value),
                        })
                      }
                      className="input-field ltr-value"
                      data-testid={`gallery-order-${image.id}`}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm font-semibold text-charcoal">
                      <input
                        type="checkbox"
                        checked={image.isVisible}
                        onChange={(event) =>
                          updateLocalImage(image.id, {
                            isVisible: event.target.checked,
                          })
                        }
                        data-testid={`gallery-visible-${image.id}`}
                      />
                      מוצג ללקוחות
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={savingId === image.id}
                  onClick={() => handleSave(image)}
                  data-testid={`gallery-save-${image.id}`}
                >
                  {savingId === image.id ? "שומר…" : "שמירה"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  disabled={deletingId === image.id}
                  onClick={() => handleDelete(image)}
                  data-testid={`gallery-delete-${image.id}`}
                >
                  {deletingId === image.id ? "מוחק…" : "מחיקה"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
