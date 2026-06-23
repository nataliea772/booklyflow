import { describe, expect, it } from "vitest";
import {
  filterAndSortServices,
  filterServices,
  sortServices,
} from "@/lib/service-filters";
import type { Service } from "@/lib/types";

function createService(overrides: Partial<Service> = {}): Service {
  return {
    id: "svc-1",
    name: "ייעוץ",
    description: "שירות ייעוץ",
    price: 100,
    durationMinutes: 30,
    isActive: true,
    ...overrides,
  };
}

const services = [
  createService({ id: "1", name: "ייעוץ", price: 100, durationMinutes: 30 }),
  createService({
    id: "2",
    name: "טיפול פנים",
    description: "טיפול",
    price: 200,
    durationMinutes: 60,
    isActive: false,
  }),
  createService({
    id: "3",
    name: "עיסוי",
    price: 150,
    durationMinutes: 45,
  }),
];

describe("filterServices", () => {
  it("filters by search query", () => {
    expect(filterServices(services, { searchQuery: "עיסוי" })).toHaveLength(1);
  });

  it("filters active services only", () => {
    expect(
      filterServices(services, { activeFilter: "active" }).map((s) => s.id)
    ).toEqual(["1", "3"]);
  });

  it("filters inactive services only", () => {
    expect(
      filterServices(services, { activeFilter: "inactive" }).map((s) => s.id)
    ).toEqual(["2"]);
  });
});

describe("sortServices", () => {
  it("sorts by price ascending", () => {
    expect(sortServices(services, "price").map((s) => s.id)).toEqual([
      "1",
      "3",
      "2",
    ]);
  });

  it("sorts by duration ascending", () => {
    expect(sortServices(services, "duration").map((s) => s.id)).toEqual([
      "1",
      "3",
      "2",
    ]);
  });
});

describe("filterAndSortServices", () => {
  it("returns empty list when search misses", () => {
    expect(
      filterAndSortServices(services, { searchQuery: "לא קיים" })
    ).toEqual([]);
  });
});
