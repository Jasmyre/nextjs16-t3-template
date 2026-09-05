import { connection } from "next/server";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import type { NavMainItem } from "@/components/nav-main";
import type { NavUserData } from "@/components/nav-user";

export async function AppShellAsync({
  children,
  navItems,
}: {
  children: ReactNode;
  navItems: NavMainItem[];
}) {
  await connection();

  const session = await auth();
  const isAdmin = session?.user.roles.includes("ADMIN") ?? false;

  const resolvedNavItems: NavMainItem[] = [
    ...navItems,
    ...(isAdmin && !navItems.some((item) => item.url === "/admin")
      ? [{ title: "Admin", url: "/admin" }]
      : []),
  ];

  const user: NavUserData | null = session?.user
    ? {
        email: session.user.email ?? "",
        image: session.user.image,
        userName: session.user.name ?? session.user.email ?? "",
      }
    : null;

  return (
    <AppShell navItems={resolvedNavItems} user={user}>
      {children}
    </AppShell>
  );
}
