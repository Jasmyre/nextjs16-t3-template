"use client";

import { Button } from "@/components/ui/button";
import { reloadPage } from "@/lib/reload-page";

/**
 * Offline retry (issue #44): reloads the failed navigation. Online this
 * restores the original page; offline the worker keeps serving the generic
 * fallback. A plain link to a signed-in page would fail offline and loop
 * back here, so the fallback retries instead of navigating away.
 */
export function RetryButton() {
  return (
    <Button onClick={reloadPage} type="button">
      Try again
    </Button>
  );
}
