import type { ReactNode } from "react";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <div className="min-h-svh bg-background">{children}</div>;
}
