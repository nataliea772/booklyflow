"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
    <header className="boutique-nav sticky top-0 z-50">
      <nav className="page-container flex h-14 items-center justify-between sm:h-16">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-bl from-[#581C87] to-[#BE185D] text-sm font-extrabold text-white shadow-md shadow-[#BE185D]/25 sm:h-10 sm:w-10">
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

        <ul className="hidden items-center gap-1 sm:flex">
          {publicLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive(link.href, link.exact)
                    ? "bg-[#FDF4FF] text-[#581C87] ring-1 ring-[#E9D5FF]"
                    : "text-[#6B7280] hover:bg-[#FFF1F5] hover:text-[#BE185D]"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="me-1 ms-3">
            <Link
              href="/login"
              className="text-xs font-medium text-[#6B7280]/80 transition-colors hover:text-[#BE185D]"
            >
              כניסת מנהל
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-[#F9A8D4]/40 bg-[#FFFDF8] p-2 text-[#581C87] sm:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="פתיחת תפריט"
          aria-expanded={mobileOpen}
        >
          <svg
            className="h-5 w-5"
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
        <div className="border-t border-[#F9A8D4]/25 px-5 py-4 sm:hidden">
          <ul className="flex flex-col gap-1">
            {publicLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive(link.href, link.exact)
                      ? "bg-[#FDF4FF] text-[#581C87]"
                      : "text-[#1F2937] hover:bg-[#FFF1F5]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-[#F9A8D4]/20 pt-3 text-center">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-xs font-medium text-[#6B7280] hover:text-[#BE185D]"
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
