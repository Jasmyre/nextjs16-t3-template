import { type ReactNode, Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { AppShellAsync } from "@/components/app-shell-async";
import type { NavMainItem } from "@/components/nav-main";

const baseNavItems: NavMainItem[] = [
  { title: "Home", url: "/" },
  { title: "Posts", url: "/posts" },
];

export default function AppLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-svh bg-background">
      <Suspense
        fallback={<AppShell navItems={baseNavItems}>{children}</AppShell>}
      >
        <AppShellAsync navItems={baseNavItems}>{children}</AppShellAsync>
      </Suspense>
    </div>
  );
}
