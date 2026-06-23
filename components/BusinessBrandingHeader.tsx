"use client";

import Image from "next/image";
import PublicContactActions from "@/components/PublicContactActions";
import type { BusinessSettings } from "@/lib/types";
import { getPublicBusinessName } from "@/lib/business-config";

type BusinessBrandingHeaderProps = {
  settings: BusinessSettings;
};

/** Compact branded header for the booking flow. */
export default function BusinessBrandingHeader({
  settings,
}: BusinessBrandingHeaderProps) {
  const businessName = getPublicBusinessName(settings);
  const hasCover = Boolean(settings.coverImageUrl);

  return (
    <section className="fabric-polka-hero-section-compact py-6 sm:py-8">
      <div className="page-container relative z-[1]">
        <div className="boutique-hero-card mx-auto max-w-2xl text-center">
          {hasCover && (
            <div className="relative h-28 overflow-hidden sm:h-32">
              <Image
                src={settings.coverImageUrl!}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
              <div className="cover-overlay absolute inset-0 opacity-90" />
            </div>
          )}

          <div className="flex flex-col items-center px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
            <div className="relative -mt-12 h-20 w-20 shrink-0 overflow-hidden rounded-full border-[4px] border-white bg-white shadow-[var(--card-shadow-lg)] ring-1 ring-black/10 sm:-mt-14 sm:h-24 sm:w-24">
              {settings.logoUrl ? (
                <Image
                  src={settings.logoUrl}
                  alt={businessName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-charcoal text-2xl font-extrabold text-white sm:text-3xl">
                  {businessName.charAt(0)}
                </div>
              )}
            </div>

            <p className="section-eyebrow mt-4">הזמנת תור</p>
            <div className="boutique-dot-divider" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {businessName}
            </h1>

            <PublicContactActions settings={settings} className="mt-4" />

            {settings.description && (
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                {settings.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
