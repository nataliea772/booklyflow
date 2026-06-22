import { type ReactNode } from "react";
import Badge from "@/components/Badge";

type PageHeaderProps = {
  badge?: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export default function PageHeader({
  badge,
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <section className="page-header-bg">
      <div className="gradient-blob -right-24 top-0 h-72 w-72 bg-primary/15" />
      <div className="gradient-blob -left-16 bottom-0 h-56 w-56 bg-secondary/10" />
      <div className="page-container relative py-14 sm:py-16 lg:py-20">
        {badge && (
          <Badge variant="primary" className="mb-5">
            {badge}
          </Badge>
        )}
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          {description}
        </p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
