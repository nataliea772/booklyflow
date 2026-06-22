"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import type { BusinessSettings } from "@/lib/types";
import { getPublicBusinessName } from "@/lib/business-config";
import { getBrandColor, getPlaceholderGradient } from "@/lib/branding";

type BoutiqueHeroProps = {
  settings: BusinessSettings;
};

export default function BoutiqueHero({ settings }: BoutiqueHeroProps) {
  const businessName = getPublicBusinessName(settings);
  const brandColor = getBrandColor(settings.primaryColor);
  const gradient = getPlaceholderGradient(businessName);
  const hasCover = Boolean(settings.coverImageUrl);

  return (
    <section className="page-container py-6 sm:py-10">
      <div className="boutique-card">
        <div
          className={`boutique-hero-cover ${hasCover ? "" : `bg-gradient-to-bl ${gradient}`}`}
          style={hasCover ? undefined : { backgroundColor: `${brandColor}08` }}
        >
          {hasCover && (
            <>
              <Image
                src={settings.coverImageUrl!}
                alt=""
                fill
                className="object-cover"
                priority
                unoptimized
              />
              <div className="cover-overlay absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF8] via-transparent to-transparent opacity-90" />
            </>
          )}
          {!hasCover && (
            <>
              <div className="absolute inset-0 mesh-grid opacity-40" />
              <div className="gradient-blob start-0 top-0 h-64 w-64 bg-[#E9D5FF]/40" />
              <div className="gradient-blob bottom-0 end-0 h-56 w-56 bg-[#F9A8D4]/35" />
              <div className="gradient-blob bottom-1/4 start-1/3 h-32 w-32 bg-[#F5D0A9]/30" />
            </>
          )}
        </div>

        <div className="relative px-5 pb-10 pt-0 text-center sm:px-10 sm:pb-14">
          <div className="boutique-logo-float">
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
                className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-bl ${gradient} text-4xl font-extrabold text-white sm:text-5xl`}
              >
                {businessName.charAt(0)}
              </div>
            )}
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-[#BE185D] sm:mt-8">
            ברוכים הבאים
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#581C87] sm:text-4xl md:text-[2.75rem] md:leading-tight">
            {businessName}
          </h1>

          {settings.description ? (
            <p className="lead mx-auto mt-4 max-w-md">{settings.description}</p>
          ) : (
            <p className="lead mx-auto mt-4 max-w-md">
              חוויית הזמנה יוקרתית — פשוטה, נעימה ומותאמת אישית.
            </p>
          )}

          {(settings.phone || settings.email || settings.address) && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {settings.phone && (
                <span className="contact-chip ltr-value">{settings.phone}</span>
              )}
              {settings.email && (
                <span className="contact-chip ltr-value">{settings.email}</span>
              )}
              {settings.address && (
                <span className="contact-chip">{settings.address}</span>
              )}
            </div>
          )}

          <div className="mt-9 flex flex-col items-center gap-3 sm:mt-10">
            <Button href="/book" size="xl" className="min-w-[240px] shadow-lg shadow-[#BE185D]/20">
              להזמנת תור
            </Button>
            <Link
              href="/login"
              className="text-xs font-medium text-[#6B7280]/90 transition-colors hover:text-[#BE185D]"
            >
              כניסת מנהל
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
