"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { getPublicBusinessName } from "@/lib/business-config";

const publicLinks = [
  { href: "/", label: "ראשי", exact: true },
  { href: "/book", label: "הזמנת תור", exact: false },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const { settings, isReady } = useBusinessSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  const businessName = isReady
    ? getPublicBusinessName(settings)
    : "העסק שלי";

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 shadow-[0_8px_32px_rgba(109,40,217,0.06)] backdrop-blur-2xl">
      <nav className="page-container flex h-16 items-center justify-between sm:h-[4.75rem]">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90"
        >
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-bl from-[#6d28d9] to-[#8b5cf6] text-base font-extrabold text-white shadow-lg shadow-primary/35 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              businessName.charAt(0)
            )}
          </span>
          <span className="truncate text-lg font-extrabold tracking-tight text-[#111827] sm:text-xl">
            {businessName}
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {publicLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                  isActive(link.href, link.exact)
                    ? "bg-primary-light/90 text-primary shadow-sm ring-1 ring-primary/15"
                    : "text-[#111827] hover:bg-white/80 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="me-2 ms-3">
            <Button href="/book" size="sm">
              הזמנת תור
            </Button>
          </li>
          <li>
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-xs font-medium text-muted transition-colors hover:text-primary"
            >
              כניסת מנהל
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-primary/10 bg-white/80 p-2.5 text-[#111827] shadow-sm transition-colors hover:bg-primary-light/50 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="פתיחת תפריט"
          aria-expanded={mobileOpen}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-primary/10 bg-white/95 px-5 py-5 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-1.5">
            {publicLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-xl px-4 py-3.5 text-sm font-bold transition-colors ${
                    isActive(link.href, link.exact)
                      ? "bg-primary-light text-primary"
                      : "text-[#111827] hover:bg-violet-50 hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-3">
              <Button href="/book" size="sm" className="w-full">
                הזמנת תור
              </Button>
            </li>
            <li className="mt-2 text-center">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-xs font-medium text-muted hover:text-primary"
              >
                כניסת מנהל
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
