import { Suspense } from "react";
import { LatestPost } from "@/components/post";
import { api, HydrateClient } from "@/trpc/server";
import { ModeToggle } from "../components/mode-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8">
      <ModeToggle />
      <Suspense fallback={<p>Loading latest post...</p>}>
        <LatestPostWithHydration />
      </Suspense>
    </main>
  );
}

async function LatestPostWithHydration() {
  await api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <LatestPost />
    </HydrateClient>
  );
}
