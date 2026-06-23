import type { Service } from "@/lib/types";

const DEFAULT_FEATURED_LIMIT = 3;

/** Returns up to `limit` active services in list order. */
export function getFeaturedServices(
  services: Service[],
  limit = DEFAULT_FEATURED_LIMIT
): Service[] {
  return services.filter((service) => service.isActive).slice(0, limit);
}
