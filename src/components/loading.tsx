import type { JSX, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Loading({
  className,
  children,
  ...props
}: Readonly<{ children?: ReactNode; className?: string }>): JSX.Element {
  return (
    <Skeleton
      className={cn("h-4 w-full rounded-md bg-muted", className)}
      {...props}
    >
      {children}
    </Skeleton>
  );
}
