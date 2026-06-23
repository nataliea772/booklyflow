type StatCardProps = {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  testId?: string;
};

export default function StatCard({
  label,
  value,
  icon,
  trend,
  testId,
}: StatCardProps) {
  return (
    <div
      data-testid={testId}
      className="flex min-h-[7.5rem] flex-col justify-between rounded-2xl border border-black/10 bg-white/95 p-5 shadow-sm transition-shadow duration-200 hover:shadow-[var(--card-shadow)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 text-right">
          <p className="text-xs font-bold tracking-wide text-muted">{label}</p>
          <p
            className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-charcoal sm:text-[1.65rem]"
            data-testid={testId ? `${testId}-value` : undefined}
          >
            {value}
          </p>
        </div>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-charcoal text-base text-white shadow-sm"
          role="img"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      {trend && (
        <p className="mt-3 text-xs font-medium leading-relaxed text-muted">
          {trend}
        </p>
      )}
    </div>
  );
}
