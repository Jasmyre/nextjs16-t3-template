"use client";

import type { RoleName } from "@prisma/client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/admin";

const roleOptions: RoleName[] = ["ADMIN", "MODERATOR", "USER"];

export function ManageRolesDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, roleNames: RoleName[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<RoleName[]>(
    user.roles.map((role) => role.name)
  );
  const [saving, setSaving] = useState(false);

  const toggle = (role: RoleName) => {
    setSelected((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(user.id, selected);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage roles</DialogTitle>
          <DialogDescription>
            Toggle roles for {user.name ?? user.email}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {roleOptions.map((role) => {
            const active = selected.includes(role);
            return (
              <button
                aria-label={`Toggle ${role}`}
                aria-pressed={active}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors",
                  active ? "border-primary/60 bg-primary/10" : "hover:bg-muted"
                )}
                key={role}
                onClick={() => toggle(role)}
                type="button"
              >
                <span className="font-medium">{role}</span>
                <Badge variant={active ? "default" : "outline"}>
                  {active ? "Assigned" : "Not assigned"}
                </Badge>
              </button>
            );
          })}
        </div>

        <DialogFooter showCloseButton={false}>
          <Button
            disabled={saving}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
