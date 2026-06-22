"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";

const adminLinks = [
  { href: "/admin", label: "לוח בקרה", exact: true },
  { href: "/admin/business", label: "פרטי העסק", exact: false },
  { href: "/admin/services", label: "שירותים", exact: false },
  { href: "/admin/appointments", label: "תורים", exact: false },
  {
    href: "/admin/blocked-times",
    label: "חסימות וחופשות",
    exact: false,
  },
  { href: "/admin/reviews", label: "ביקורות", exact: false },
];

function navLinkClassName(isLinkActive: boolean): string {
  const base =
    "flex min-h-[44px] w-full items-center justify-center rounded-2xl px-3 py-2.5 text-center text-sm font-bold transition-all duration-200";

  if (isLinkActive) {
    return `${base} btn-gradient text-white shadow-md shadow-primary/25`;
  }

  return `${base} border border-primary/10 bg-white/80 text-[#111827] hover:border-primary/20 hover:bg-primary-light/50 hover:text-primary`;
}

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, authRequired, user } = useAuth();

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  async function handleLogout() {
    await logout();
    router.replace(authRequired ? "/login" : "/");
  }

  return (
    <header
      className="sticky top-0 z-50 mb-6 w-full overflow-x-hidden sm:mb-8 lg:mb-10"
      data-testid="admin-nav"
    >
      <div className="mx-auto w-full max-w-7xl rounded-2xl border border-white/80 bg-[#FFFDF8]/95 px-4 shadow-[var(--card-shadow)] backdrop-blur-xl sm:px-5">
        <div className="flex items-center justify-end gap-3 border-b border-primary/10 py-2.5">
          {authRequired && user?.email && (
            <span
              className="min-w-0 truncate text-xs font-medium text-muted sm:text-sm ltr-value"
              data-testid="admin-user-email"
            >
              {user.email}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-testid="logout-button"
            className="shrink-0"
          >
            התנתקות
          </Button>
        </div>

        <nav
          className="grid grid-cols-2 gap-2 py-3 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-6"
          aria-label="ניווט ניהול"
        >
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navLinkClassName(isActive(link.href, link.exact))}
              aria-current={
                isActive(link.href, link.exact) ? "page" : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
