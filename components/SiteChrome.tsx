"use client";

import { usePathname } from "next/navigation";
import PublicFooter from "@/components/PublicFooter";
import PublicNavbar from "@/components/PublicNavbar";

function usesPolkaPageBackground(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/book") ||
    pathname.startsWith("/review/") ||
    pathname === "/thank-you"
  );
}

function isPublicCustomerRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/book") ||
    pathname.startsWith("/review/")
  );
}

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showPublicChrome = isPublicCustomerRoute(pathname);
  const polkaBackground = usesPolkaPageBackground(pathname);

  return (
    <>
      {showPublicChrome && <PublicNavbar />}
      <main
        className={
          polkaBackground ? "polka-page-bg min-h-full flex-1" : "flex-1"
        }
      >
        {children}
      </main>
      {showPublicChrome && <PublicFooter />}
    </>
  );
}
