"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DeletePostDialog({
  title,
  open,
  onOpenChange,
  onConfirm,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete post</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{title}&quot;? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton={false}>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="destructive">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
