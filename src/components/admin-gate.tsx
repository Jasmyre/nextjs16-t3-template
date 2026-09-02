import { forbidden } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { auth } from "@/auth";

export async function AdminGate({
  children,
}: Readonly<{ children: ReactNode }>) {
  await connection();

  const session = await auth();
  const isAdmin = session?.user.roles.includes("ADMIN") ?? false;

  if (!isAdmin) {
    forbidden();
  }

  return children;
}
