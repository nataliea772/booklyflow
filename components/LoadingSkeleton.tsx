type LoadingSkeletonProps = {
  rows?: number;
  className?: string;
};

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-neutral-100 ${className}`}
      aria-hidden="true"
    />
  );
}

export function LoadingSkeleton({
  rows = 3,
  className = "",
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonBlock key={index} className="h-24 w-full" />
      ))}
    </div>
  );
}

export function PageLoadingState({ label = "טוען…" }: { label?: string }) {
  return (
    <div
      className="page-container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20"
      role="status"
      aria-live="polite"
    >
      <div className="loader-premium" aria-hidden="true" />
      <p className="text-sm font-semibold text-muted">{label}</p>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonBlock key={index} className="h-36 w-full" />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonBlock key={index} className="h-28 w-full" />
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <SkeletonBlock className="h-12 w-full" />
      <SkeletonBlock className="h-12 w-full" />
      <SkeletonBlock className="h-24 w-full" />
      <SkeletonBlock className="h-12 w-2/3" />
    </div>
  );
}
