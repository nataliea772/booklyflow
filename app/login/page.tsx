"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
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
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.replace("/admin");
  }

  if (!authRequired || loading || isAuthenticated) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center py-20">
        <div
          className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="page-header-bg">
      <div className="page-container flex min-h-[calc(100vh-5rem)] items-center justify-center py-16 sm:py-24">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Badge variant="primary" className="mb-4">
              Admin access
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
              Sign in to BooklyFlow
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Manage appointments, services, and your business dashboard.
            </p>
          </div>

          <Card padding="lg" elevated accent="primary">
            <CardHeader
              title="Admin Login"
              description="Use your Supabase admin credentials."
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2.5 block text-sm font-bold text-[#111827]"
                >
                  Email
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
                  className="input-field"
                  data-testid="login-email-input"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2.5 block text-sm font-bold text-[#111827]"
                >
                  Password
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
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
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
                {isSubmitting ? "Signing in…" : "Sign In →"}
              </Button>
            </form>
          </Card>

          <p className="mt-8 text-center text-sm text-muted">
            Customer booking is public at{" "}
            <a href="/book" className="font-semibold text-primary hover:underline">
              /book
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
