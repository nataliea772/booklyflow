import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

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
    "bg-charcoal text-white shadow-md shadow-black/15 hover:bg-black hover:shadow-lg hover:shadow-black/20 active:scale-[0.98] focus-visible:ring-charcoal",
  secondary:
    "bg-neutral-800 text-white shadow-md hover:bg-black active:scale-[0.98] focus-visible:ring-charcoal",
  outline:
    "border-2 border-black/15 bg-white text-charcoal shadow-sm hover:border-black/30 hover:bg-neutral-50 active:scale-[0.98] focus-visible:ring-charcoal",
  ghost:
    "bg-transparent text-charcoal hover:bg-neutral-100 active:scale-[0.98] focus-visible:ring-charcoal",
  danger:
    "border-2 border-red-200 bg-white text-red-700 shadow-sm hover:border-red-300 hover:bg-red-50 active:scale-[0.98] focus-visible:ring-red-400",
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
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={combinedClassName} {...linkProps}>
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
