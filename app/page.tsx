"use client";

import Link from "next/link";
import Button from "@/components/Button";
import BusinessBrandingHeader from "@/components/BusinessBrandingHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import ServiceImage from "@/components/ServiceImage";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useServices } from "@/hooks/useServices";
import { getPublicBusinessName } from "@/lib/business-config";
import { formatPrice } from "@/lib/i18n";
import { customerBookingSteps } from "@/lib/marketing";

export default function HomePage() {
  const { settings, isReady: settingsReady } = useBusinessSettings();
  const { services, isReady: servicesReady } = useServices();

  const isReady = settingsReady && servicesReady;
  const activeServices = services.filter((service) => service.isActive);
  const businessName = getPublicBusinessName(settings);
  const displaySettings = { ...settings, businessName };

  if (!isReady) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center py-20">
        <div className="loader-premium" role="status" aria-label="טוען" />
      </div>
    );
  }

  return (
    <>
      <BusinessBrandingHeader settings={displaySettings} />

      <section className="page-container py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display-section text-3xl sm:text-4xl">
            ברוכים הבאים
          </h2>
          <p className="lead mx-auto mt-4 max-w-2xl">
            {settings.description ||
              `שמחים לראות אתכם! הזמינו תור ב-${businessName} בכמה צעדים פשוטים.`}
          </p>
          <div className="mt-8 flex justify-center">
            <Button href="/book" size="xl">
              הזמנת תור
            </Button>
          </div>
        </div>
      </section>

      {activeServices.length > 0 && (
        <section className="page-container pb-12 sm:pb-16">
          <div className="mb-8 text-center sm:mb-10">
            <p className="section-eyebrow">השירותים שלנו</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#111827] sm:text-3xl">
              מה אפשר להזמין
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeServices.slice(0, 6).map((service) => (
              <Link
                key={service.id}
                href="/book"
                className="group overflow-hidden rounded-2xl border border-primary/10 bg-white/80 shadow-[var(--card-shadow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--card-shadow-lg)]"
              >
                <ServiceImage
                  name={service.name}
                  imageUrl={service.imageUrl}
                  seed={service.id}
                  size="lg"
                  className="rounded-none ring-0"
                />
                <div className="p-5">
                  <p className="text-lg font-bold text-[#111827] group-hover:text-primary">
                    {service.name}
                  </p>
                  {service.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                      {service.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-3 text-sm font-semibold">
                    <span className="rounded-lg bg-primary-soft px-3 py-1 text-primary">
                      {service.durationMinutes} דק׳
                    </span>
                    <span className="text-[#111827]">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {activeServices.length > 6 && (
            <div className="mt-8 text-center">
              <Button href="/book" variant="outline" size="lg">
                לכל השירותים
              </Button>
            </div>
          )}
        </section>
      )}

      {activeServices.length === 0 && (
        <section className="page-container pb-12 sm:pb-16">
          <EmptyState
            compact
            icon="✨"
            title="בקרוב — שירותים חדשים"
            description="העסק מעדכן כעת את רשימת השירותים. חזרו בקרוב או צרו קשר ישירות."
            action={{ label: "לדף ההזמנה", href: "/book" }}
          />
        </section>
      )}

      <section className="page-container section-spacing pt-0">
        <div className="mb-10 text-center sm:mb-14">
          <p className="section-eyebrow">איך זה עובד</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#111827] sm:text-3xl">
            הזמנה ב-3 צעדים
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          {customerBookingSteps.map((step, index) => (
            <Card key={step.title} glass accent="primary" padding="md">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-xl ring-1 ring-primary/10">
                {step.icon}
              </span>
              <p className="mt-4 text-xs font-bold text-primary">
                שלב {index + 1}
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-[#111827]">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-container pb-20 sm:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-bl from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] px-6 py-14 shadow-2xl shadow-primary/30 sm:rounded-[2.5rem] sm:px-14 sm:py-16">
          <div className="absolute inset-0 mesh-grid opacity-20" />
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              מוכנים להזמין?
            </h2>
            <p className="mx-auto mt-4 text-lg leading-relaxed text-white/90">
              בחרו שירות, מועד נוח — ונשלים את ההזמנה תוך דקות.
            </p>
            <div className="mt-8">
              <Button
                href="/book"
                size="xl"
                className="bg-white text-primary shadow-xl hover:bg-white hover:shadow-2xl"
              >
                הזמנת תור
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
