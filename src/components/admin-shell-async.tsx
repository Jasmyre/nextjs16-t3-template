import { connection } from "next/server";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin-shell";
import type { NavMainItem } from "@/components/nav-main";
import { mapSessionToNavUser } from "@/lib/shell";

export async function AdminShellAsync({
  children,
  navItems,
}: {
  children: ReactNode;
  navItems: NavMainItem[];
}) {
  await connection();

  const session = await auth();

  const user = mapSessionToNavUser(session?.user);

  return (
    <AdminShell navItems={navItems} user={user}>
      {children}
    </AdminShell>
  );
}
