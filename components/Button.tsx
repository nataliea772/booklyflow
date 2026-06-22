import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type BaseProps = {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps & {
  href: string;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "btn-gradient text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/45 active:scale-[0.98] focus-visible:ring-primary relative overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
  secondary:
    "bg-gradient-to-l from-secondary to-[#ec4899] text-white shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40 active:scale-[0.98] focus-visible:ring-secondary",
  outline:
    "border-2 border-primary/18 bg-white/90 text-primary shadow-sm backdrop-blur-sm hover:border-primary/35 hover:bg-white hover:shadow-[var(--card-shadow)] active:scale-[0.98] focus-visible:ring-primary",
  ghost:
    "bg-transparent text-[#111827] hover:bg-primary-light/70 hover:text-primary active:scale-[0.98] focus-visible:ring-primary",
};

const sizeStyles = {
  sm: "rounded-xl px-5 py-2.5 text-xs",
  md: "rounded-2xl px-7 py-3.5 text-sm",
  lg: "rounded-2xl px-8 py-4 text-base font-bold",
  xl: "rounded-2xl px-10 py-4 text-base font-extrabold sm:px-12 sm:py-5 sm:text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2.5 font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0";

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if ("href" in props && props.href) {
    const { href } = props;
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  const { href: _, ...buttonProps } = props as ButtonAsButton;
  return (
    <button className={combinedClassName} {...buttonProps}>
      {children}
    </button>
  );
}
