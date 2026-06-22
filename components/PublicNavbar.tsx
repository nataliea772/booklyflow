"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { getPublicBusinessName } from "@/lib/business-config";

const publicLinks = [
  { href: "/", label: "ראשי", exact: true },
  { href: "/book", label: "הזמנת תור", exact: false },
] as const;

function linkClassName(isLinkActive: boolean, compact = false): string {
  const base = compact
    ? "block rounded-xl px-4 py-3 text-sm font-semibold transition-colors"
    : "inline-flex items-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200";

  if (isLinkActive) {
    return `${base} bg-[#FDF4FF] text-[#581C87] ring-1 ring-[#E9D5FF]`;
  }

  return compact
    ? `${base} text-[#1F2937] hover:bg-[#FFF1F5]`
    : `${base} text-[#6B7280] hover:bg-[#FFF1F5] hover:text-[#BE185D]`;
}

export default function PublicNavbar() {
  const pathname = usePathname();
  const { settings, isReady } = useBusinessSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  const businessName = isReady
    ? getPublicBusinessName(settings)
    : "העסק שלי";

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <header className="boutique-nav relative sticky top-0 z-50">
      <nav
        className="page-container relative flex h-20 min-h-[72px] flex-nowrap items-center gap-3"
        aria-label="ניווט ראשי"
      >
        <Link
          href="/"
          className="flex min-w-0 max-w-[42vw] shrink items-center gap-2.5 transition-opacity hover:opacity-90 sm:max-w-[240px] md:max-w-[280px]"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-bl from-[#581C87] to-[#BE185D] text-sm font-extrabold text-white shadow-md shadow-[#BE185D]/25">
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
          <span className="truncate text-base font-bold tracking-tight text-[#581C87] sm:text-lg">
            {businessName}
          </span>
        </Link>

        <ul className="hidden flex-1 flex-nowrap items-center justify-center gap-1 md:flex">
          {publicLinks.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                className={linkClassName(isActive(link.href, link.exact))}
                aria-current={
                  isActive(link.href, link.exact) ? "page" : undefined
                }
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden shrink-0 md:block">
          <Link
            href="/login"
            className="inline-flex items-center whitespace-nowrap text-xs font-medium text-[#6B7280]/90 transition-colors hover:text-[#BE185D]"
          >
            כניסת מנהל
          </Link>
        </div>

        <div className="ms-auto flex shrink-0 flex-nowrap items-center gap-2 md:hidden">
          <Link
            href="/book"
            className={`inline-flex h-10 items-center whitespace-nowrap rounded-full px-4 text-sm font-bold shadow-sm transition-all ${
              isActive("/book", false)
                ? "bg-[#581C87] text-white ring-2 ring-[#E9D5FF]"
                : "bg-gradient-to-l from-[#7C3AED] to-[#BE185D] text-white hover:shadow-md"
            }`}
          >
            הזמנת תור
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F9A8D4]/40 bg-[#FFFDF8] text-[#581C87] transition-colors hover:border-[#BE185D]/35 hover:bg-[#FFF1F5]"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "סגירת תפריט" : "פתיחת תפריט"}
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
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
        </div>
      </nav>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-20 z-40 bg-[#581C87]/10 backdrop-blur-[1px] md:hidden"
            aria-label="סגירת תפריט"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="public-mobile-menu"
            className="absolute inset-x-0 top-full z-50 border-b border-[#F9A8D4]/25 bg-[#FFFDF8]/98 shadow-lg shadow-[#BE185D]/10 backdrop-blur-xl md:hidden"
          >
            <div className="page-container py-4">
              <ul className="flex flex-col gap-1">
                {publicLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={linkClassName(
                        isActive(link.href, link.exact),
                        true
                      )}
                      aria-current={
                        isActive(link.href, link.exact) ? "page" : undefined
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="mt-2 border-t border-[#F9A8D4]/20 pt-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-2.5 text-center text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#FFF1F5] hover:text-[#BE185D]"
                  >
                    כניסת מנהל
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
