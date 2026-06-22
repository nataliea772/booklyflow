import Button from "@/components/Button";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  children?: ReactNode;
  compact?: boolean;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={
        compact
          ? "relative flex flex-col items-center px-4 py-10 text-center"
          : "surface-premium relative flex flex-col items-center overflow-hidden px-6 py-14 text-center sm:px-10 sm:py-16"
      }
    >
      {!compact && (
        <>
          <div className="empty-state-glow pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute -top-16 start-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-[#f9a8d4]/20 blur-3xl" />
        </>
      )}

      <div className="relative">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-gradient-to-bl from-[#fff1f7] via-white to-[#fce7f3] text-4xl shadow-[var(--card-shadow)] ring-1 ring-[#f9a8d4]/35">
          <span role="img" aria-hidden="true">
            {icon}
          </span>
        </div>
        <div className="absolute -inset-3 -z-10 rounded-[2rem] border border-dashed border-[#f9a8d4]/30" />
      </div>

      <h3 className="relative mt-8 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
        {title}
      </h3>
      <p className="relative mt-3 max-w-md text-base leading-relaxed text-muted sm:text-lg">
        {description}
      </p>
      {children}
      {action && (
        <Button href={action.href} size="lg" className="relative mt-8">
          {action.label}
        </Button>
      )}
    </div>
  );
}
