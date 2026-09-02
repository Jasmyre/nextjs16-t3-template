import { Suspense } from "react";
import { ErrorPage } from "@/components/error-page";
import {
  HomeLinkFallback,
  SessionHomeLink,
} from "@/components/session-home-link";

export default function ForbiddenPage() {
  return (
    <ErrorPage title="You don't have permission to access this page">
      <Suspense fallback={<HomeLinkFallback label="Back to Dashboard" />}>
        <SessionHomeLink label="Back to Dashboard" />
      </Suspense>
    </ErrorPage>
  );
}
