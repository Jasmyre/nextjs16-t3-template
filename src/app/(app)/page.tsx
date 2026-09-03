import { Dashboard } from "@/components/dashboard";
import { api, HydrateClient } from "@/trpc/server";

export default async function DashboardPage() {
  await Promise.all([
    api.dashboard.getStats.prefetch(),
    api.post.list.prefetch(),
  ]);

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
      <HydrateClient>
        <Dashboard />
      </HydrateClient>
    </main>
  );
}
