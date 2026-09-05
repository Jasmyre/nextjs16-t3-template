"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MainSidebar } from "@/components/main-sidebar";
import type { NavMainItem } from "@/components/nav-main";
import type { NavUserData } from "@/components/nav-user";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const sectionTitleMap: Record<string, string> = {
  "/": "Home",
  "/posts": "Posts",
  "/posts/new": "New Post",
};

function getSectionTitle(pathname: string): string {
  const direct = sectionTitleMap[pathname];
  if (direct) {
    return direct;
  }
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return "Home";
  }
  const last = segments.at(-1) ?? "Home";
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
}

export function AppShell({
  children,
  navItems,
  user,
}: {
  children: ReactNode;
  navItems: NavMainItem[];
  user?: NavUserData | null;
}) {
  const pathname = usePathname();
  const title = getSectionTitle(pathname);

  return (
    <SidebarProvider>
      <MainSidebar navItems={navItems} user={user} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <Separator className="h-5" orientation="vertical" />
          <span className="font-medium text-sm">{title}</span>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
