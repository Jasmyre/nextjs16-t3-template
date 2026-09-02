"use client";

import type { RoleName } from "@prisma/client";
import { Settings2 } from "lucide-react";
import { useState } from "react";
import { ManageRolesDialog } from "@/components/manage-roles-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import type { AdminUser } from "@/types/admin";

const roleBadgeVariant: Record<RoleName, "default" | "secondary" | "outline"> =
  {
    ADMIN: "default",
    MODERATOR: "secondary",
    USER: "outline",
  };

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function UserTable() {
  const [users] = api.admin.listUsers.useSuspenseQuery();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const utils = api.useUtils();
  const updateRoles = api.admin.updateRoles.useMutation({
    onSuccess: async () => {
      await utils.admin.listUsers.invalidate();
    },
  });

  const handleSave = async (userId: string, roleNames: RoleName[]) => {
    await updateRoles.mutateAsync({ userId, roleNames });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage user accounts and roles.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-muted border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium" scope="col">
                  Name
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Email
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Roles
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Joined
                </th>
                <th className="px-4 py-3 text-right font-medium" scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {users.map((user) => (
                <tr className="hover:bg-muted/40" key={user.id}>
                  <td className="px-4 py-3 font-medium">{user.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles.map((role) => (
                        <Badge
                          key={role.id}
                          variant={roleBadgeVariant[role.name]}
                        >
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      aria-label={`Manage roles for ${user.name ?? user.email}`}
                      className="cursor-pointer"
                      onClick={() => setEditingUser(user)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {editingUser && (
        <ManageRolesDialog
          onOpenChange={(open) => {
            if (!open) {
              setEditingUser(null);
            }
          }}
          onSave={handleSave}
          open={Boolean(editingUser)}
          user={editingUser}
        />
      )}
    </Card>
  );
}
