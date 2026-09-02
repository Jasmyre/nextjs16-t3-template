import { Suspense } from "react";
import { ErrorPage } from "@/components/error-page";
import {
  HomeLinkFallback,
  SessionHomeLink,
} from "@/components/session-home-link";

export default function NotFoundPage() {
  return (
    <ErrorPage title="Page not found">
      <Suspense fallback={<HomeLinkFallback label="Go Home" />}>
        <SessionHomeLink label="Go Home" />
      </Suspense>
    </ErrorPage>
  );
}
