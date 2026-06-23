"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { pickPublicGalleryImages } from "@/lib/business-gallery-display";
import { getVisibleGalleryImages } from "@/lib/supabase/business-gallery";
import type { BusinessGalleryImage } from "@/lib/types";

export default function BusinessGallery() {
  const [images, setImages] = useState<BusinessGalleryImage[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadGallery() {
      try {
        const visibleImages = await getVisibleGalleryImages();
        if (!cancelled) {
          setImages(pickPublicGalleryImages(visibleImages));
          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to load business gallery:", error);
        if (!cancelled) {
          setImages([]);
          setIsReady(true);
        }
      }
    }

    loadGallery();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isReady || images.length === 0) {
    return null;
  }

  return (
    <section
      className="page-container py-8 sm:py-12"
      data-testid="business-gallery-section"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="boutique-dot-divider" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h2 className="mt-3 text-2xl font-extrabold text-charcoal sm:text-3xl">
            תמונות מהעסק
          </h2>
          <div className="boutique-title-rule" aria-hidden="true" />
        </div>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5">
          {images.map((image) => (
            <li key={image.id}>
              <figure
                className="overflow-hidden rounded-[1.25rem] border border-black/10 bg-white shadow-[var(--card-shadow)]"
                data-testid={`business-gallery-image-${image.id}`}
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={image.imageUrl}
                    alt={image.altText?.trim() || "תמונה מהעסק"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
                {image.altText && (
                  <figcaption className="border-t border-black/8 px-3 py-2 text-right text-xs text-muted">
                    {image.altText}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
