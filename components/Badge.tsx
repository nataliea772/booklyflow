import { type ReactNode } from "react";

type BadgeVariant = "primary" | "secondary" | "neutral";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  primary: "badge badge-primary",
  secondary: "badge badge-secondary",
  neutral: "badge bg-white text-foreground ring-1 ring-primary/10 shadow-sm",
};

export default function Badge({
  children,
  variant = "primary",
  className = "",
}: BadgeProps) {
  return (
    <span className={`${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
