"use client";

import type { Service } from "@/lib/types";
import { formatPrice } from "@/lib/i18n";
import ServiceImage from "@/components/ServiceImage";

type ServiceSelectCardsProps = {
  services: Service[];
  selectedId: string;
  onSelect: (serviceId: string) => void;
};

export default function ServiceSelectCards({
  services,
  selectedId,
  onSelect,
}: ServiceSelectCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {services.map((service) => {
        const isSelected = selectedId === service.id;

        return (
          <button
            key={service.id}
            type="button"
            data-testid={`service-card-${service.id}`}
            onClick={() => onSelect(service.id)}
            className={`group overflow-hidden rounded-2xl border text-right transition-all duration-300 ${
              isSelected
                ? "border-primary/40 bg-primary-soft/50 shadow-[var(--ring-glow)] ring-2 ring-primary/25"
                : "border-primary/10 bg-white/80 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--card-shadow)]"
            }`}
          >
            <ServiceImage
              name={service.name}
              imageUrl={service.imageUrl}
              seed={service.id}
              size="lg"
              className="rounded-none ring-0"
            />
            <div className="space-y-2 p-4">
              <p className="text-lg font-bold text-[#111827] group-hover:text-primary">
                {service.name}
              </p>
              {service.description && (
                <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex rounded-lg bg-primary-soft px-3 py-1 text-xs font-bold text-primary ring-1 ring-primary/10">
                  {service.durationMinutes} דק׳
                </span>
                <span className="text-sm font-bold text-[#111827]">
                  {formatPrice(service.price)}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
