type StatCardProps = {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  variant?: "primary" | "amber" | "emerald" | "secondary";
};

const variantConfig = {
  primary: {
    iconBg: "bg-gradient-to-br from-primary-light to-primary/10",
    iconRing: "ring-primary/20",
    glow: "from-primary/5 to-transparent",
  },
  amber: {
    iconBg: "bg-gradient-to-br from-amber-50 to-amber-100/50",
    iconRing: "ring-amber-200/60",
    glow: "from-amber-50/80 to-transparent",
  },
  emerald: {
    iconBg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
    iconRing: "ring-emerald-200/60",
    glow: "from-emerald-50/80 to-transparent",
  },
  secondary: {
    iconBg: "bg-gradient-to-br from-secondary-light to-secondary/10",
    iconRing: "ring-secondary/20",
    glow: "from-secondary/5 to-transparent",
  },
};

export default function StatCard({
  label,
  value,
  icon,
  trend,
  variant = "primary",
}: StatCardProps) {
  const config = variantConfig[variant];

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-primary/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 card-elevated hover:shadow-[var(--card-shadow-hover)]">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.glow} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-muted">{label}</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#111827]">
            {value}
          </p>
          {trend && (
            <p className="mt-2 text-sm font-medium text-primary">{trend}</p>
          )}
        </div>
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ring-1 ${config.iconBg} ${config.iconRing}`}
          role="img"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
