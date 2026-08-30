import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { connection } from "next/server";
import { cache, Suspense } from "react";

import { type AppRouter, createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

const { trpc: api, HydrateClient: BaseHydrateClient } =
  createHydrationHelpers<AppRouter>(caller, getQueryClient);

export { api };

/**
 * Wraps the tRPC `HydrateClient` so the page is explicitly rendered dynamically.
 *
 * `BaseHydrateClient` dehydrates the query cache via `@tanstack/query-core`, which stamps
 * `dehydratedAt: Date.now()`. Next.js prerendering rejects `Date.now()` unless request data
 * (e.g. `connection()`) is accessed first, so we guard it here and wrap it in a `Suspense`
 * boundary to satisfy `cacheComponents`. This keeps the fix in one place for every page that
 * uses `HydrateClient`.
 */
export function HydrateClient(props: { children: React.ReactNode }) {
  return (
    <Suspense>
      <DynamicHydrateClient>{props.children}</DynamicHydrateClient>
    </Suspense>
  );
}

async function DynamicHydrateClient(props: { children: React.ReactNode }) {
  await connection();

  return <BaseHydrateClient>{props.children}</BaseHydrateClient>;
}
