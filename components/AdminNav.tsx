"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/services", label: "Services", icon: "✨", exact: false },
  {
    href: "/admin/appointments",
    label: "Appointments",
    icon: "📋",
    exact: false,
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="mb-10 inline-flex flex-wrap gap-2 rounded-2xl border border-primary/10 bg-white p-2 shadow-[var(--card-shadow)]">
      {adminLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`inline-flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
            isActive(link.href, link.exact)
              ? "btn-gradient text-white shadow-lg shadow-primary/25"
              : "text-[#111827] hover:bg-violet-50 hover:text-primary"
          }`}
        >
          <span aria-hidden="true">{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
