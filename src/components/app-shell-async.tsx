import { ShieldCheckIcon } from "lucide-react";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import type { NavMainItem } from "@/components/nav-main";
import { mapSessionToNavUser } from "@/lib/shell";

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
      ? [
          {
            icon: <ShieldCheckIcon />,
            title: "Admin",
            url: "/admin",
          } satisfies NavMainItem,
        ]
      : []),
  ];

  const user = mapSessionToNavUser(session?.user);

  return (
    <AppShell navItems={resolvedNavItems} user={user}>
      {children}
    </AppShell>
  );
}
