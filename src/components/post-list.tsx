"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeletePostDialog } from "@/components/delete-post-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { PostListItem } from "@/types/post";

const NEW_POST_PATH = "/posts/new";

export function PostList() {
  const [posts] = api.post.list.useSuspenseQuery();
  const [deleting, setDeleting] = useState<PostListItem | null>(null);

  const utils = api.useUtils();
  const deletePost = api.post.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.post.list.invalidate(),
        utils.dashboard.getStats.invalidate(),
      ]);
    },
  });

  const handleConfirmDelete = async () => {
    if (!deleting) {
      return;
    }

    await deletePost.mutateAsync({ id: deleting.id });
    setDeleting(null);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Posts</CardTitle>
          <CardDescription>All posts you are allowed to see.</CardDescription>
        </div>
        <Button asChild>
          <Link href={NEW_POST_PATH}>
            <Plus />
            New Post
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-muted border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium" scope="col">
                  Title
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Author
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Created
                </th>
                <th className="px-4 py-3 text-right font-medium" scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {posts.map((post) => (
                <tr className="hover:bg-muted/40" key={post.id}>
                  <td className="px-4 py-3 font-medium">{post.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {post.author.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        aria-label={`Edit ${post.name}`}
                        asChild
                        className="cursor-pointer"
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Link href={`/posts/${post.id}/edit`}>
                          <Pencil />
                        </Link>
                      </Button>
                      <Button
                        aria-label={`Delete ${post.name}`}
                        className="cursor-pointer"
                        onClick={() => setDeleting(post)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {deleting && (
        <DeletePostDialog
          onConfirm={handleConfirmDelete}
          onOpenChange={(open) => {
            if (!open) {
              setDeleting(null);
            }
          }}
          open
          title={deleting.name}
        />
      )}
    </Card>
  );
}
