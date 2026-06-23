type StatCardProps = {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  variant?: "primary" | "amber" | "emerald" | "secondary";
  testId?: string;
};

const variantConfig = {
  primary: {
    iconBg: "bg-neutral-50",
    iconRing: "ring-black/10",
    accent: "bg-charcoal",
    glow: "from-black/5 via-transparent to-transparent",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconRing: "ring-amber-200/70",
    accent: "bg-amber-500",
    glow: "from-amber-100/80 via-transparent to-transparent",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconRing: "ring-emerald-200/70",
    accent: "bg-emerald-500",
    glow: "from-emerald-100/80 via-transparent to-transparent",
  },
  secondary: {
    iconBg: "bg-neutral-50",
    iconRing: "ring-black/10",
    accent: "bg-neutral-600",
    glow: "from-black/5 via-transparent to-transparent",
  },
};

export default function StatCard({
  label,
  value,
  icon,
  trend,
  variant = "primary",
  testId,
}: StatCardProps) {
  const config = variantConfig[variant];

  return (
    <div
      data-testid={testId}
      className="group relative overflow-hidden rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[var(--card-shadow-lg)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--card-shadow-hover)] sm:p-7"
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${config.accent}`}
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-bl ${config.glow} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted sm:text-sm">
            {label}
          </p>
          <p className="mt-3 text-4xl font-extrabold tracking-tight text-charcoal">
            {value}
          </p>
          {trend && (
            <p className="mt-2 text-sm font-semibold text-muted">{trend}</p>
          )}
        </div>
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ring-1 shadow-sm ${config.iconBg} ${config.iconRing}`}
          role="img"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
