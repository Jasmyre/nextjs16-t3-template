import { type ReactNode, Suspense } from "react";
import { AdminGate } from "@/components/admin-gate";
import { AdminShell } from "@/components/admin-shell";
import { AdminShellAsync } from "@/components/admin-shell-async";
import type { NavMainItem } from "@/components/nav-main";

const adminNavItems: NavMainItem[] = [
  { title: "Back to Dashboard", url: "/" },
  { title: "Users", url: "/admin" },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-svh bg-background">
      <Suspense fallback={null}>
        <AdminGate>
          <Suspense
            fallback={
              <AdminShell navItems={adminNavItems}>{children}</AdminShell>
            }
          >
            <AdminShellAsync navItems={adminNavItems}>
              {children}
            </AdminShellAsync>
          </Suspense>
        </AdminGate>
      </Suspense>
    </div>
  );
}
