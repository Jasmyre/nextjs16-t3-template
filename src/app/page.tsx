import { Suspense } from "react";
import { LatestPost } from "@/components/post";
import { api, HydrateClient } from "@/trpc/server";
import { ModeToggle } from "../components/mode-toggle";

export default async function Home() {
  api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center gap-8">
        <ModeToggle />
        <Suspense>
          <LatestPost />
        </Suspense>
      </main>
    </HydrateClient>
  );
}
