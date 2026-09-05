import type { ReactNode } from "react";

interface PageHeaderProps {
  children?: ReactNode;
  description?: string;
  title: string;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-xl space-y-1">
        <h1 className="font-heading font-semibold text-xl tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}
