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
      <div className="gradient-blob start-0 top-0 h-80 w-80 bg-[#8b5cf6]/18" />
      <div className="gradient-blob bottom-0 end-0 h-64 w-64 bg-secondary/12" />
      <div className="page-container relative py-12 sm:py-16 lg:py-20">
        {badge && (
          <Badge variant="primary" className="mb-5">
            {badge}
          </Badge>
        )}
        <h1 className="display-section max-w-3xl">{title}</h1>
        <p className="lead mt-4 max-w-2xl">{description}</p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
