"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

type ImageUploadFieldProps = {
  id?: string;
  label: string;
  hint?: string;
  currentUrl?: string;
  previewAspect?: "square" | "cover";
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
};

export default function ImageUploadField({
  id: externalId,
  label,
  hint,
  currentUrl,
  previewAspect = "square",
  onFileSelect,
  disabled = false,
}: ImageUploadFieldProps) {
  const generatedId = useId();
  const inputId = externalId ?? generatedId;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = previewUrl ?? currentUrl ?? null;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = event.target.files?.[0] ?? null;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (!file) {
      onFileSelect(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("יש לבחור קובץ תמונה.");
      onFileSelect(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("גודל מקסימלי: 5MB.");
      onFileSelect(null);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    onFileSelect(file);
  }

  const previewClass =
    previewAspect === "cover"
      ? "aspect-[21/9] w-full rounded-2xl"
      : "aspect-square h-28 w-28 rounded-2xl";

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2.5 block text-sm font-bold text-[#111827]"
      >
        {label}
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={`relative overflow-hidden border border-primary/10 bg-gradient-to-bl from-primary/10 via-white to-secondary/10 ${previewClass}`}
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted">
              אין תמונה
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleChange}
            disabled={disabled}
            className="block w-full text-sm text-muted file:me-4 file:rounded-xl file:border-0 file:bg-primary-soft file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-primary hover:file:bg-primary-light/80"
          />
          {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
          {error && (
            <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
