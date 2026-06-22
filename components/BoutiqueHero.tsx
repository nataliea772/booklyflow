"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import PublicContactActions from "@/components/PublicContactActions";
import type { BusinessSettings } from "@/lib/types";
import { getPublicBusinessName } from "@/lib/business-config";
import { getPlaceholderGradient } from "@/lib/branding";

type BoutiqueHeroProps = {
  settings: BusinessSettings;
};

export default function BoutiqueHero({ settings }: BoutiqueHeroProps) {
  const businessName = getPublicBusinessName(settings);
  const gradient = getPlaceholderGradient(businessName);
  const hasCover = Boolean(settings.coverImageUrl);

  return (
    <section className="page-container py-6 sm:py-10">
      <div className="boutique-card hero-glow-ring">
        <div
          className={`boutique-hero-cover ${hasCover ? "" : "luxury-hero-gradient"}`}
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#fffafc] via-transparent to-transparent opacity-90" />
            </>
          )}
          {!hasCover && (
            <>
              <div className="absolute inset-0 mesh-grid opacity-30" />
              <div className="gradient-blob start-0 top-0 h-64 w-64 bg-rose/20" />
              <div className="gradient-blob bottom-0 end-0 h-56 w-56 bg-[#f9a8d4]/25" />
            </>
          )}
        </div>

        <div className="relative bg-gradient-to-b from-[#fffafc] to-[#fff1f7] px-5 pb-10 pt-0 text-center sm:px-10 sm:pb-14">
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

          <p className="section-eyebrow mt-6 sm:mt-8">ברוכים הבאים</p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-charcoal sm:text-4xl md:text-[2.75rem] md:leading-tight">
            {businessName}
          </h1>

          <PublicContactActions settings={settings} className="mt-5" />

          {settings.description && (
            <p className="lead mx-auto mt-4 max-w-md">{settings.description}</p>
          )}

          {(settings.email || settings.address) && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {settings.email && (
                <span className="contact-chip ltr-value">{settings.email}</span>
              )}
              {settings.address && (
                <span className="contact-chip">{settings.address}</span>
              )}
            </div>
          )}

          <div className="mt-9 flex flex-col items-center gap-3 sm:mt-10">
            <Button
              href="/book"
              size="xl"
              className="min-w-[240px] shadow-lg shadow-rose/25"
            >
              להזמנת תור
            </Button>
            <Link
              href="/login"
              className="text-xs font-medium text-muted transition-colors hover:text-rose"
            >
              כניסת מנהל
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
