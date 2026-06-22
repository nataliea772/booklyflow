import Image from "next/image";
import type { BusinessSettings } from "@/lib/types";
import { getPublicBusinessName } from "@/lib/business-config";
import { getBrandColor, getPlaceholderGradient } from "@/lib/branding";

type BusinessBrandingHeaderProps = {
  settings: BusinessSettings;
};

export default function BusinessBrandingHeader({ settings }: BusinessBrandingHeaderProps) {
  const businessName = getPublicBusinessName(settings);
  const brandColor = getBrandColor(settings.primaryColor);
  const gradient = getPlaceholderGradient(businessName);

  return (
    <section className="relative overflow-hidden">
      <div className={`relative h-44 sm:h-56 lg:h-64 ${settings.coverImageUrl ? "" : `bg-gradient-to-bl ${gradient}`}`} style={settings.coverImageUrl ? undefined : { backgroundColor: `${brandColor}18` }}>
        {settings.coverImageUrl ? (
          <Image src={settings.coverImageUrl} alt="" fill className="object-cover" priority unoptimized />
        ) : (
          <>
            <div className="absolute inset-0 mesh-grid opacity-30" />
            <div className="gradient-blob start-0 top-0 h-64 w-64 bg-white/10" />
            <div className="gradient-blob bottom-0 end-0 h-48 w-48 bg-secondary/20" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/50 via-[#111827]/10 to-transparent" />
      </div>
      <div className="page-container relative -mt-16 pb-8 sm:-mt-20 sm:pb-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-[var(--card-shadow-lg)] sm:h-28 sm:w-28">
            {settings.logoUrl ? (
              <Image src={settings.logoUrl} alt={businessName} fill className="object-cover" unoptimized />
            ) : (
              <div className={`flex h-full w-full items-center justify-center bg-gradient-to-bl ${gradient} text-3xl font-extrabold text-white sm:text-4xl`}>{businessName.charAt(0)}</div>
            )}
          </div>
          <div className="min-w-0 flex-1 text-white sm:pb-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">הזמנת תור</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{businessName}</h1>
            {settings.description && <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">{settings.description}</p>}
            {(settings.phone || settings.email || settings.address) && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
                {settings.phone && <span className="ltr-value">{settings.phone}</span>}
                {settings.email && <span className="ltr-value">{settings.email}</span>}
                {settings.address && <span>{settings.address}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
