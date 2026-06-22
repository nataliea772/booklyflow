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
    iconBg: "bg-gradient-to-bl from-[#fff1f7] to-white",
    iconRing: "ring-[#f9a8d4]/40",
    accent: "from-charcoal/80 to-rose/40",
    glow: "from-[#f9a8d4]/12 via-transparent to-transparent",
  },
  amber: {
    iconBg: "bg-gradient-to-bl from-amber-50 to-white",
    iconRing: "ring-amber-200/70",
    accent: "from-[#f59e0b]/70 to-amber-300/30",
    glow: "from-amber-100/80 via-transparent to-transparent",
  },
  emerald: {
    iconBg: "bg-gradient-to-bl from-emerald-50 to-white",
    iconRing: "ring-emerald-200/70",
    accent: "from-[#22c55e]/70 to-emerald-300/30",
    glow: "from-emerald-100/80 via-transparent to-transparent",
  },
  secondary: {
    iconBg: "bg-gradient-to-bl from-secondary-light to-white",
    iconRing: "ring-secondary/25",
    accent: "from-secondary/70 to-pink-300/30",
    glow: "from-secondary/10 via-transparent to-transparent",
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
      className="group relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/85 p-6 shadow-[var(--card-shadow-lg)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--card-shadow-hover)] sm:p-7"
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l ${config.accent}`}
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
            <p className="mt-2 text-sm font-semibold text-rose/90">{trend}</p>
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
