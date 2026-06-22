"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, isAuthenticated, authRequired } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authRequired) {
      router.replace("/admin");
      return;
    }

    if (!loading && isAuthenticated) {
      router.replace("/admin");
    }
  }, [authRequired, loading, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.error) {
      setError("פרטי ההתחברות שגויים. אנא נסו שוב.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/admin");
  }

  if (!authRequired || loading || isAuthenticated) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center py-20">
        <div className="loader-premium" role="status" aria-label="טוען" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <div className="absolute inset-0 mesh-grid opacity-50" />
      <div className="gradient-blob start-0 top-0 h-[28rem] w-[28rem] bg-[#8b5cf6]/20" />
      <div className="gradient-blob bottom-0 end-0 h-80 w-80 bg-secondary/15" />

      <div className="page-container relative flex min-h-[calc(100vh-5rem)] items-center justify-center py-12 sm:py-20">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center sm:mb-10">
            <Badge variant="primary" className="mb-5">
              אזור ניהול
            </Badge>
            <h1 className="display-section text-3xl sm:text-4xl">
              כניסת מנהל
            </h1>
            <p className="lead mt-4">
              אזור ניהול לבעלי העסק — התחברו כדי לנהל תורים ושירותים
            </p>
          </div>

          <div className="surface-premium relative hero-glow-ring overflow-hidden p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[#6d28d9] to-[#8b5cf6]" />
            <form onSubmit={handleSubmit} className="relative space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2.5 block text-sm font-bold text-[#111827]"
                >
                  אימייל
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@yourbusiness.com"
                  className="input-field ltr-value"
                  data-testid="login-email-input"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2.5 block text-sm font-bold text-[#111827]"
                >
                  סיסמה
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  data-testid="login-password-input"
                />
              </div>

              {error && (
                <p
                  className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm font-semibold text-red-700 backdrop-blur-sm"
                  data-testid="login-error-message"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
                data-testid="login-submit-button"
              >
                {isSubmitting ? "מתחבר…" : "← התחברות"}
              </Button>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-muted">
            <a href="/" className="hover:text-primary hover:underline">
              חזרה לדף הראשי
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
