import { UserTable } from "@/components/user-table";
import { api, HydrateClient } from "@/trpc/server";

export default async function AdminPage() {
  await api.admin.listUsers.prefetch();

  return (
    <main
      className="w-full min-w-0 flex-1 p-4 lg:px-8"
      data-testid="admin-shell"
    >
      <HydrateClient>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-heading font-semibold text-2xl">
              User management
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              View and manage all registered users.
            </p>
          </div>
          <UserTable />
        </div>
      </HydrateClient>
    </main>
  );
}
