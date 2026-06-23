import type { BusinessGalleryImage } from "@/lib/types";

export const PUBLIC_GALLERY_MIN = 1;
export const PUBLIC_GALLERY_MAX = 6;

export function sortGalleryImages(
  images: BusinessGalleryImage[]
): BusinessGalleryImage[] {
  return [...images].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }

    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function pickPublicGalleryImages(
  images: BusinessGalleryImage[],
  limit = PUBLIC_GALLERY_MAX
): BusinessGalleryImage[] {
  return sortGalleryImages(
    images.filter((image) => image.isVisible)
  ).slice(0, limit);
}

export function hasPublicGalleryImages(
  images: BusinessGalleryImage[]
): boolean {
  return pickPublicGalleryImages(images).length >= PUBLIC_GALLERY_MIN;
}
