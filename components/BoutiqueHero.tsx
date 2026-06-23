"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import PublicContactActions from "@/components/PublicContactActions";
import type { BusinessSettings } from "@/lib/types";
import { getPublicBusinessName } from "@/lib/business-config";

type BoutiqueHeroProps = {
  settings: BusinessSettings;
};

export default function BoutiqueHero({ settings }: BoutiqueHeroProps) {
  const businessName = getPublicBusinessName(settings);
  const hasCover = Boolean(settings.coverImageUrl);

  return (
    <section className="fabric-polka-hero-section py-10 sm:py-14">
      <div className="page-container relative z-[1]">
        <div className="boutique-hero-card mx-auto max-w-2xl text-center">
          {hasCover && (
            <div className="relative h-44 overflow-hidden sm:h-52">
              <Image
                src={settings.coverImageUrl!}
                alt=""
                fill
                className="object-cover"
                priority
                unoptimized
              />
              <div className="cover-overlay absolute inset-0" />
            </div>
          )}

          <div className="px-6 pb-10 pt-0 sm:px-10 sm:pb-12">
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
                <div className="flex h-full w-full items-center justify-center rounded-full bg-charcoal text-4xl font-extrabold text-white sm:text-5xl">
                  {businessName.charAt(0)}
                </div>
              )}
            </div>

            <p className="section-eyebrow mt-6 sm:mt-8">ברוכים הבאים</p>
            <div className="boutique-dot-divider" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-charcoal sm:text-5xl md:text-[3.25rem] md:leading-tight">
              {businessName}
            </h1>

            <PublicContactActions settings={settings} className="mt-6" />

            {settings.description && (
              <p className="lead mx-auto mt-5 max-w-md">{settings.description}</p>
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

            <div className="boutique-title-rule" aria-hidden="true" />

            <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10">
              <Button href="/book" size="xl" className="min-w-[240px]">
                להזמנת תור
              </Button>
              <Link
                href="/login"
                className="text-xs font-medium text-muted transition-colors hover:text-charcoal"
              >
                כניסת מנהל
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
