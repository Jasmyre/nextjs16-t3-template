import { type ReactNode, Suspense } from "react";
import { AdminGate } from "@/components/admin-gate";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-svh bg-background">
      <Suspense fallback={null}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </div>
  );
}
