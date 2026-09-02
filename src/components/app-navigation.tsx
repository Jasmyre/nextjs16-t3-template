import { connection } from "next/server";
import { auth } from "@/auth";
import { type NavItem, NavigationBar } from "@/components/navigation-bar";

export function AppNavBar({ navItems }: { navItems: NavItem[] }) {
  return (
    <NavigationBar
      enableBlock
      navItems={navItems}
      pageItems={navItems}
      title="Template"
    />
  );
}

export async function AppNavigation({ navItems }: { navItems: NavItem[] }) {
  await connection();

  const session = await auth();
  const isAdmin = session?.user.roles.includes("ADMIN") ?? false;

  const resolvedNavItems: NavItem[] = [
    ...navItems,
    ...(isAdmin && !navItems.some((item) => item.href === "/admin")
      ? [{ name: "Admin", href: "/admin" }]
      : []),
  ];

  return <AppNavBar navItems={resolvedNavItems} />;
}
