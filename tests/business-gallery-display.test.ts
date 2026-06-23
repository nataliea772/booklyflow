import { describe, expect, it } from "vitest";
import {
  hasPublicGalleryImages,
  pickPublicGalleryImages,
} from "@/lib/business-gallery-display";
import type { BusinessGalleryImage } from "@/lib/types";

function createImage(
  overrides: Partial<BusinessGalleryImage> = {}
): BusinessGalleryImage {
  return {
    id: "img-1",
    imageUrl: "https://example.com/1.jpg",
    displayOrder: 0,
    isVisible: true,
    createdAt: "2026-06-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("pickPublicGalleryImages", () => {
  it("returns only visible images sorted by display order", () => {
    const images = [
      createImage({ id: "2", displayOrder: 2 }),
      createImage({ id: "1", displayOrder: 1 }),
      createImage({ id: "3", isVisible: false }),
    ];

    expect(pickPublicGalleryImages(images).map((image) => image.id)).toEqual([
      "1",
      "2",
    ]);
  });

  it("limits to six images", () => {
    const images = Array.from({ length: 8 }, (_, index) =>
      createImage({ id: String(index), displayOrder: index })
    );

    expect(pickPublicGalleryImages(images)).toHaveLength(6);
  });
});

describe("hasPublicGalleryImages", () => {
  it("returns false when there are no visible images", () => {
    expect(hasPublicGalleryImages([createImage({ isVisible: false })])).toBe(
      false
    );
  });

  it("returns true when at least one visible image exists", () => {
    expect(hasPublicGalleryImages([createImage()])).toBe(true);
  });
});
