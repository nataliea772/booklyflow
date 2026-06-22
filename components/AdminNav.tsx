"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";

const adminLinks = [
  { href: "/admin", label: "לוח בקרה", icon: "📊", exact: true },
  { href: "/admin/business", label: "פרטי העסק", icon: "🏢", exact: false },
  { href: "/admin/services", label: "ניהול שירותים", icon: "✨", exact: false },
  {
    href: "/admin/appointments",
    label: "ניהול תורים",
    icon: "📋",
    exact: false,
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, authRequired, user } = useAuth();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  async function handleLogout() {
    await logout();
    router.replace(authRequired ? "/login" : "/");
  }

  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/admin" className="flex items-center gap-2 text-sm font-bold text-[#111827]">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-bl from-[#6d28d9] to-[#8b5cf6] text-xs font-extrabold text-white shadow-md shadow-primary/25">
          B
        </span>
        <span>
          Bookly<span className="text-gradient">Flow</span>
        </span>
      </Link>
      <nav className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-white/80 bg-white/75 p-1.5 shadow-[var(--card-shadow)] backdrop-blur-xl">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 sm:px-5 sm:py-3 ${
              isActive(link.href, link.exact)
                ? "btn-gradient text-white shadow-lg shadow-primary/30"
                : "text-[#111827] hover:bg-primary-light/60 hover:text-primary"
            }`}
          >
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {authRequired && user?.email && (
          <span className="hidden text-sm font-medium text-muted sm:inline ltr-value">
            {user.email}
          </span>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          data-testid="logout-button"
        >
          התנתקות
        </Button>
      </div>
    </div>
  );
}
