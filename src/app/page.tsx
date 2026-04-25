import { HydrateClient } from "@/trpc/server";
import { ModeToggle } from "../components/mode-toggle";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="flex min-h-screen items-center justify-center">
        <ModeToggle />
      </div>
    </HydrateClient>
  );
}
