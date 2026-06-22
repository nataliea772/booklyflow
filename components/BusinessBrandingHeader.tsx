"use client";

import Image from "next/image";
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
      <div className="boutique-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <div className="relative mx-auto h-20 w-20 shrink-0 overflow-hidden rounded-full border-[3px] border-[#FDF4FF] shadow-[var(--card-shadow)] ring-2 ring-[#F9A8D4]/25 sm:mx-0 sm:h-24 sm:w-24">
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
            >
              {businessName.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-right">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#BE185D]">
            הזמנת תור
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#581C87] sm:text-3xl">
            {businessName}
          </h1>
          {settings.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#6B7280] sm:text-base">
              {settings.description}
            </p>
          )}
        </div>

        {hasCover && (
          <div className="relative hidden h-20 w-32 shrink-0 overflow-hidden rounded-2xl sm:block lg:h-24 lg:w-40">
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

        {!hasCover && (
          <div
            className={`hidden h-20 w-32 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-bl ${gradient} sm:block lg:h-24 lg:w-40`}
            style={{ backgroundColor: `${brandColor}10` }}
            aria-hidden="true"
          />
        )}
      </div>
    </section>
  );
}
