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
            className={`group overflow-hidden rounded-[1.5rem] border text-right transition-all duration-300 ${
              isSelected
                ? "service-card-selected scale-[1.01]"
                : "border-[rgba(190,24,93,0.1)] bg-[#FFFDF8] hover:-translate-y-1 hover:border-[#F9A8D4]/50 hover:shadow-[var(--card-shadow)]"
            }`}
          >
            <div className="service-catalog-image">
              <ServiceImage
                name={service.name}
                imageUrl={service.imageUrl}
                seed={service.id}
                size="lg"
                className="!h-full !min-h-[7.5rem] rounded-none ring-0 sm:!min-h-[8.5rem]"
              />
              {isSelected && (
                <span className="absolute start-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#BE185D] shadow-sm ring-1 ring-[#F9A8D4]/40">
                  נבחר
                </span>
              )}
            </div>
            <div className="space-y-2 p-4 sm:p-5">
              <p
                className={`text-lg font-bold transition-colors ${
                  isSelected
                    ? "text-[#581C87]"
                    : "text-[#1F2937] group-hover:text-[#BE185D]"
                }`}
              >
                {service.name}
              </p>
              {service.description && (
                <p className="line-clamp-2 text-sm leading-relaxed text-[#6B7280]">
                  {service.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex rounded-full bg-[#FDF4FF] px-3 py-1 text-xs font-bold text-[#581C87] ring-1 ring-[#E9D5FF]">
                  {service.durationMinutes} דק׳
                </span>
                <span className="text-sm font-bold text-[#BE185D]">
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
