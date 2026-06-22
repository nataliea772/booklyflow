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
    : "inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-all duration-200";

  if (isLinkActive) {
    return `${base} bg-gradient-to-l from-rose to-[#ec4899] text-white shadow-md shadow-rose/30 ring-1 ring-[#f9a8d4]/40`;
  }

  return compact
    ? `${base} text-[#fffafc] hover:bg-white/10`
    : `${base} text-[#f9a8d4]/90 hover:bg-white/10 hover:text-[#fffafc]`;
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
    <header className="boutique-nav sticky top-0 z-50 h-[76px] shrink-0 overflow-hidden">
      <div className="page-container flex h-[76px] items-center justify-between gap-3 overflow-hidden">
        <Link
          href="/"
          className="flex min-w-0 max-w-[55%] items-center gap-2 overflow-hidden transition-opacity hover:opacity-90 sm:max-w-[320px]"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-bl from-[#111014] to-rose text-sm font-extrabold text-white shadow-md shadow-rose/30 ring-1 ring-[#f9a8d4]/30">
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
          <span className="truncate text-base font-bold tracking-tight text-[#fffafc] sm:text-lg">
            {businessName}
          </span>
        </Link>

        <div className="hidden shrink-0 items-center gap-1 md:flex">
          <nav className="flex items-center gap-1" aria-label="קישורי ניווט">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClassName(isActive(link.href, link.exact))}
                aria-current={
                  isActive(link.href, link.exact) ? "page" : undefined
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-full px-4 text-xs font-medium text-[#f9a8d4]/85 transition-colors hover:bg-white/10 hover:text-[#fffafc]"
          >
            כניסת מנהל
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <Link
            href="/book"
            className={`inline-flex h-10 max-w-[132px] items-center justify-center truncate rounded-full px-4 text-sm font-bold shadow-sm transition-all ${
              isActive("/book", false)
                ? "bg-gradient-to-l from-rose to-[#ec4899] text-white ring-2 ring-[#f9a8d4]/50"
                : "btn-gradient text-white hover:shadow-md"
            }`}
          >
            הזמנת תור
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#f9a8d4]/30 bg-white/10 text-[#fffafc] transition-colors hover:border-[#f9a8d4]/50 hover:bg-white/15"
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
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-[76px] z-40 bg-[#111014]/40 backdrop-blur-[1px] md:hidden"
            aria-label="סגירת תפריט"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="public-mobile-menu"
            className="fixed inset-x-0 top-[76px] z-50 border-b border-[#f9a8d4]/20 bg-[#2a1026]/98 shadow-lg shadow-black/20 backdrop-blur-xl md:hidden"
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
              </ul>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
