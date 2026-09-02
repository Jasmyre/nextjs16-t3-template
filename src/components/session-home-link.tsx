import Link from "next/link";
import { connection } from "next/server";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { homePathFor } from "@/routes";

export function HomeLinkFallback({ label }: Readonly<{ label: string }>) {
  return (
    <Button disabled size="lg">
      {label}
    </Button>
  );
}

export async function SessionHomeLink({ label }: Readonly<{ label: string }>) {
  await connection();

  const session = await auth();
  const href = homePathFor(session !== null);

  return (
    <Button asChild size="lg">
      <Link href={href}>{label}</Link>
    </Button>
  );
}
