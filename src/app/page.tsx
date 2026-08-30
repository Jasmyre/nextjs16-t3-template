import { LatestPost } from "@/components/post";
import { HydrateClient } from "@/trpc/server";
import { ModeToggle } from "../components/mode-toggle";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center gap-8">
        <ModeToggle />
        <LatestPost />
      </main>
    </HydrateClient>
  );
}
