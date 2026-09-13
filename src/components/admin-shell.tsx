"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { MainSidebar } from "@/components/main-sidebar";
import type { NavMainItem } from "@/components/nav-main";
import type { NavUserData } from "@/components/nav-user";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSectionTitle } from "@/lib/shell";

const sectionTitleMap: Record<string, string> = {
  "/admin": "Admin",
};

export function AdminShell({
  children,
  navItems,
  user,
}: {
  children: ReactNode;
  navItems: NavMainItem[];
  user?: NavUserData | null;
}) {
  return (
    <SidebarProvider>
      <MainSidebar groupLabel="Admin" navItems={navItems} user={user} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <Separator className="h-5" orientation="vertical" />
          <Suspense
            fallback={<span className="font-medium text-sm">Admin</span>}
          >
            <SectionTitle />
          </Suspense>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

function SectionTitle() {
  const pathname = usePathname();
  const title = getSectionTitle(pathname, sectionTitleMap, "Admin");

  return <span className="font-medium text-sm">{title}</span>;
}
