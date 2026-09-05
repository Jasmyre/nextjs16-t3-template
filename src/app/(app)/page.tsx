import { Dashboard } from "@/components/dashboard";
import { api, HydrateClient } from "@/trpc/server";

export default async function DashboardPage() {
  await Promise.all([
    api.dashboard.getStats.prefetch(),
    api.post.list.prefetch(),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10">
      <HydrateClient>
        <Dashboard />
      </HydrateClient>
    </main>
  );
}
