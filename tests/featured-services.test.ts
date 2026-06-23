import { describe, expect, it } from "vitest";
import { getFeaturedServices } from "@/lib/featured-services";
import type { Service } from "@/lib/types";

function createService(
  id: string,
  overrides: Partial<Service> = {}
): Service {
  return {
    id,
    name: `Service ${id}`,
    description: "Description",
    price: 50,
    durationMinutes: 60,
    isActive: true,
    ...overrides,
  };
}

describe("getFeaturedServices", () => {
  it("returns nothing when there are no active services", () => {
    const services = [
      createService("1", { isActive: false }),
      createService("2", { isActive: false }),
    ];

    expect(getFeaturedServices(services)).toEqual([]);
  });

  it("returns up to three active services in order", () => {
    const services = [
      createService("1"),
      createService("2", { isActive: false }),
      createService("3"),
      createService("4"),
      createService("5"),
    ];

    expect(getFeaturedServices(services).map((service) => service.id)).toEqual([
      "1",
      "3",
      "4",
    ]);
  });

  it("respects a custom limit", () => {
    const services = [
      createService("1"),
      createService("2"),
      createService("3"),
    ];

    expect(getFeaturedServices(services, 2)).toHaveLength(2);
  });
});
