"use client";

import Image from "next/image";
import PublicContactActions from "@/components/PublicContactActions";
import type { BusinessSettings } from "@/lib/types";
import { getPublicBusinessName } from "@/lib/business-config";
import { getBrandColor, getPlaceholderGradient } from "@/lib/branding";

type BusinessBrandingHeaderProps = {
  settings: BusinessSettings;
};

/** Compact branded header for the booking flow. */
export default function BusinessBrandingHeader({
  settings,
}: BusinessBrandingHeaderProps) {
  const businessName = getPublicBusinessName(settings);
  const brandColor = getBrandColor(settings.primaryColor);
  const gradient = getPlaceholderGradient(businessName);
  const hasCover = Boolean(settings.coverImageUrl);

  return (
    <section className="page-container py-5 sm:py-7">
      <div className="boutique-card overflow-hidden p-5 sm:p-8">
        {hasCover && (
          <div className="relative -mx-5 -mt-5 mb-5 h-28 overflow-hidden sm:-mx-8 sm:-mt-8 sm:mb-6 sm:h-32">
            <Image
              src={settings.coverImageUrl!}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
            <div className="cover-overlay absolute inset-0 opacity-80" />
          </div>
        )}

        <div className="flex flex-col items-center text-center">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-[3px] border-[#FDF4FF] shadow-[var(--card-shadow)] ring-2 ring-[#F9A8D4]/25 sm:h-24 sm:w-24">
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={businessName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-gradient-to-bl ${gradient} text-2xl font-extrabold text-white sm:text-3xl`}
                style={{ backgroundColor: `${brandColor}10` }}
              >
                {businessName.charAt(0)}
              </div>
            )}
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[#BE185D]">
            הזמנת תור
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#581C87] sm:text-3xl">
            {businessName}
          </h1>

          <PublicContactActions settings={settings} className="mt-4" />

          {settings.description && (
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#6B7280] sm:text-base">
              {settings.description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
