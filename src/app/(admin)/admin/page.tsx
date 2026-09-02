import { UserTable } from "@/components/user-table";
import { api, HydrateClient } from "@/trpc/server";

export default async function AdminPage() {
  await api.admin.listUsers.prefetch();

  return (
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
  );
}
