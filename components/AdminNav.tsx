"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";

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
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <nav className="inline-flex flex-wrap gap-2 rounded-2xl border border-primary/10 bg-white p-2 shadow-[var(--card-shadow)]">
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

      <div className="flex items-center gap-3">
        {authRequired && user?.email && (
          <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          data-testid="logout-button"
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
