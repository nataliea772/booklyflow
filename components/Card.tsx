import { type ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
  hover?: boolean;
  elevated?: boolean;
  glass?: boolean;
  accent?: "primary" | "secondary" | "none";
};

type CardHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
};

const paddingStyles = {
  none: "",
  sm: "p-6",
  md: "p-7 sm:p-8",
  lg: "p-8 sm:p-10 lg:p-11",
};

const accentStyles = {
  primary: "before:bg-charcoal",
  secondary: "before:bg-neutral-400",
  none: "",
};

export default function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  elevated = false,
  glass = false,
  accent = "none",
}: CardProps) {
  const hasAccent = accent !== "none";
  const surface = glass
    ? "glass-card border-black/10 bg-white"
    : "border-black/8 bg-white backdrop-blur-sm";

  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border ${surface} ${paddingStyles[padding]} ${hover ? "card-hover" : elevated ? "card-elevated" : ""} ${hasAccent ? `before:absolute before:inset-x-0 before:top-0 before:h-1 before:content-[''] ${accentStyles[accent]}` : ""} ${className}`}
      style={
        !hover && !elevated && !glass
          ? { boxShadow: "var(--card-shadow)" }
          : undefined
      }
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, eyebrow }: CardHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && <p className="section-eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-xl font-extrabold tracking-tight text-charcoal sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-base leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2 shrink-0 sm:mt-0">{action}</div>}
    </div>
  );
}
