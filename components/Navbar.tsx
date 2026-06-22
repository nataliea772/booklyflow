"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book" },
  { href: "/admin", label: "Admin" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-violet-200/60 bg-white shadow-[0_1px_3px_rgba(124,58,237,0.06)]">
      <nav className="page-container flex h-16 items-center justify-between sm:h-[4.5rem]">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#9333ea] text-base font-bold text-white shadow-lg shadow-primary/30">
            B
          </span>
          <span className="text-xl font-bold tracking-tight text-[#111827]">
            Bookly<span className="text-primary">Flow</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-primary-light text-primary"
                    : "text-[#111827] hover:bg-violet-50 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="ml-3">
            <Button href="/book" size="sm">
              Book Now
            </Button>
          </li>
        </ul>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl p-2.5 text-[#111827] transition-colors hover:bg-violet-50 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
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
        <div className="border-t border-violet-200/60 bg-white px-5 py-5 md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive(link.href)
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
                Book Now
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
