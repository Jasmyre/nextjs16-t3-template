import { type ReactNode, Suspense } from "react";
import { AdminGate } from "@/components/admin-gate";
import { AdminShell } from "@/components/admin-shell";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-svh bg-background">
      <Suspense fallback={null}>
        <AdminGate>
          <AdminShell>{children}</AdminShell>
        </AdminGate>
      </Suspense>
    </div>
  );
}
