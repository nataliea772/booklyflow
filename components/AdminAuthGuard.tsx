"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

type AdminAuthGuardProps = {
  children: React.ReactNode;
};

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { loading, isAuthenticated, authRequired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && authRequired && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, authRequired, isAuthenticated, router]);

  if (!authRequired) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center py-20">
        <div className="text-center">
          <div className="loader-premium mx-auto" role="status" aria-label="טוען" />
          <p className="mt-4 text-muted">בודקים התחברות…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
