import { type ReactNode, Suspense } from "react";
import { AppNavBar, AppNavigation } from "@/components/app-navigation";
import type { NavItem } from "@/components/navigation-bar";

const baseNavItems: NavItem[] = [
  { name: "Dashboard", href: "/" },
  { name: "Posts", href: "/posts" },
];

export default function AppLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Suspense fallback={<AppNavBar navItems={baseNavItems} />}>
        <AppNavigation navItems={baseNavItems} />
      </Suspense>
      {children}
    </>
  );
}
