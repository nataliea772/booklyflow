"use client";

import Link from "next/link";
import { useMemo } from "react";
import Button from "@/components/Button";
import ServiceImage from "@/components/ServiceImage";
import { useServices } from "@/hooks/useServices";
import { getFeaturedServices } from "@/lib/featured-services";
import { formatPrice } from "@/lib/i18n";
import { formatDurationHebrew } from "@/lib/time-format";

export default function FeaturedServices() {
  const { services, isReady } = useServices();

  const featuredServices = useMemo(
    () => getFeaturedServices(services),
    [services]
  );

  if (!isReady || featuredServices.length === 0) {
    return null;
  }

  return (
    <section
      className="page-container py-8 sm:py-12"
      data-testid="featured-services-section"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="boutique-dot-divider" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h2 className="mt-3 text-2xl font-extrabold text-charcoal sm:text-3xl">
            שירותים נבחרים
          </h2>
          <div className="boutique-title-rule" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted sm:text-base">
            בחרי שירות והמשיכי להזמנת תור
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {featuredServices.map((service) => (
            <li key={service.id}>
              <article
                className="featured-service-card flex h-full flex-col overflow-hidden text-right"
                data-testid={`featured-service-${service.id}`}
              >
                <div className="service-catalog-image">
                  <ServiceImage
                    name={service.name}
                    imageUrl={service.imageUrl}
                    seed={service.id}
                    size="lg"
                    className="!h-full !min-h-[9rem] rounded-none ring-0"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-charcoal">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
                      {service.description}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-charcoal ring-1 ring-black/8">
                      {formatDurationHebrew(service.durationMinutes)}
                    </span>
                    <span className="text-sm font-bold text-charcoal">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                  <Button
                    href="/book"
                    size="sm"
                    className="mt-5 w-full"
                    data-testid={`featured-service-book-${service.id}`}
                  >
                    להזמנה
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <Link
            href="/book"
            className="text-sm font-semibold text-charcoal underline-offset-4 transition-colors hover:text-black hover:underline"
          >
            לכל השירותים והזמנת תור
          </Link>
        </div>
      </div>
    </section>
  );
}
