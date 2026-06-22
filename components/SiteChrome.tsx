"use client";

import { usePathname } from "next/navigation";
import PublicFooter from "@/components/PublicFooter";
import PublicNavbar from "@/components/PublicNavbar";

function isPublicCustomerRoute(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/book");
}

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showPublicChrome = isPublicCustomerRoute(pathname);

  return (
    <>
      {showPublicChrome && <PublicNavbar />}
      <main className="flex-1">{children}</main>
      {showPublicChrome && <PublicFooter />}
    </>
  );
}
