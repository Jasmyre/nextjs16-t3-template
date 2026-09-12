import { WifiOff } from "lucide-react";
import Link from "next/link";
import { RetryButton } from "@/components/retry-button";
import { Button } from "@/components/ui/button";

/**
 * Generic public fallback (issues #43, #44): the only offline document the
 * worker serves. Fully static — no session read, no search params — so the
 * precache holds one deployment-constant copy and the proxy needs no
 * session to serve it. Recovery retries the failed navigation (restoring
 * the page when back online) instead of linking to a signed-in page that
 * would fail offline and loop back here.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card">
        <WifiOff aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
      </div>
      <h1 className="mt-6 font-semibold text-3xl tracking-tight">
        You&apos;re offline
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground leading-7">
        This page needs a connection. Check your network and try again — nothing
        was lost.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <RetryButton />
        <Button asChild variant="outline">
          <Link href="/landing">Back to landing</Link>
        </Button>
      </div>
    </main>
  );
}
