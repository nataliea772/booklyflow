import { type ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
  hover?: boolean;
  elevated?: boolean;
  accent?: "primary" | "secondary" | "none";
};

type CardHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

const paddingStyles = {
  none: "",
  sm: "p-6",
  md: "p-7 sm:p-8",
  lg: "p-9 sm:p-11",
};

const accentStyles = {
  primary: "before:bg-gradient-to-r before:from-primary before:to-[#9333ea]",
  secondary: "before:bg-gradient-to-r before:from-secondary before:to-[#ec4899]",
  none: "",
};

export default function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  elevated = false,
  accent = "none",
}: CardProps) {
  const hasAccent = accent !== "none";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-primary/10 bg-white ${paddingStyles[padding]} ${hover ? "card-hover" : elevated ? "card-elevated" : ""} ${hasAccent ? `before:absolute before:inset-x-0 before:top-0 before:h-1 before:content-[''] ${accentStyles[accent]}` : ""} ${className}`}
      style={
        !hover && !elevated ? { boxShadow: "var(--card-shadow)" } : undefined
      }
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#111827]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-base leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-4 shrink-0 sm:mt-0">{action}</div>}
    </div>
  );
}
