import type { Service } from "@/lib/types";

export type ServiceActiveFilter = "all" | "active" | "inactive";

export type ServiceSortOption = "newest" | "price" | "duration";

export type ServiceFilterInput = {
  searchQuery?: string;
  activeFilter?: ServiceActiveFilter;
  sortBy?: ServiceSortOption;
};

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

export function filterServices(
  services: Service[],
  input: ServiceFilterInput = {}
): Service[] {
  const search = normalizeSearch(input.searchQuery ?? "");
  const activeFilter = input.activeFilter ?? "all";

  return services.filter((service) => {
    if (activeFilter === "active" && !service.isActive) {
      return false;
    }

    if (activeFilter === "inactive" && service.isActive) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [service.name, service.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function sortServices(
  services: Service[],
  sortBy: ServiceSortOption = "newest"
): Service[] {
  const sorted = [...services];

  switch (sortBy) {
    case "price":
      return sorted.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, "he"));
    case "duration":
      return sorted.sort(
        (a, b) =>
          a.durationMinutes - b.durationMinutes ||
          a.name.localeCompare(b.name, "he")
      );
    case "newest":
    default:
      return sorted;
  }
}

export function filterAndSortServices(
  services: Service[],
  input: ServiceFilterInput = {}
): Service[] {
  const filtered = filterServices(services, input);
  return sortServices(filtered, input.sortBy ?? "newest");
}
