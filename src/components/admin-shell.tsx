"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh lg:pl-64">
      <AdminSidebar pathname={pathname} />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:py-10">{children}</main>
    </div>
  );
}
