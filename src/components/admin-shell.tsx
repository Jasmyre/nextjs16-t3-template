"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <AdminSidebar pathname={pathname} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <Separator className="h-5" orientation="vertical" />
          <span className="font-medium text-sm">Admin</span>
        </header>
        <main className="w-full flex-1 p-4 lg:px-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
