import Badge from "@/components/Badge";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  badge?: string;
  badgeVariant?: "primary" | "secondary" | "neutral";
  title: string;
  description?: string;
  align?: "center" | "start";
  children?: ReactNode;
};

export default function SectionHeading({
  badge,
  badgeVariant = "secondary",
  title,
  description,
  align = "center",
  children,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "mx-auto text-center" : "text-right";

  return (
    <div className={`max-w-3xl ${alignClass}`}>
      {badge && (
        <Badge variant={badgeVariant} className="mb-5">
          {badge}
        </Badge>
      )}
      <h2 className="display-section">{title}</h2>
      {description && <p className="lead mt-5">{description}</p>}
      {children}
    </div>
  );
}
