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
      className={cn(
        "h-4 w-full rounded-md bg-gray-300 dark:bg-gray-700",
        className
      )}
      {...props}
    >
      {children}
    </Skeleton>
  );
}
