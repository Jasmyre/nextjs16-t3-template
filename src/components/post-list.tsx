"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeletePostDialog } from "@/components/delete-post-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="fade-in-0 flex animate-in flex-col gap-6 duration-200 ease-out motion-reduce:animate-none">
      <PageHeader description="All posts you are allowed to see." title="Posts">
        <Button asChild>
          <Link href={NEW_POST_PATH}>
            <Plus />
            New Post
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border/70 border-b text-left">
                  <th
                    className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide"
                    scope="col"
                  >
                    Title
                  </th>
                  <th
                    className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide"
                    scope="col"
                  >
                    Author
                  </th>
                  <th
                    className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide"
                    scope="col"
                  >
                    Created
                  </th>
                  <th className="px-5 py-3 text-right" scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {posts.map((post) => (
                  <tr
                    className="transition-colors duration-150 ease-ui hover:bg-muted/40"
                    key={post.id}
                  >
                    <td className="px-5 py-3.5 font-medium">{post.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {post.author.name}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          aria-label={`Edit ${post.name}`}
                          asChild
                          className="cursor-pointer text-muted-foreground hover:text-foreground"
                          size="icon-sm"
                          variant="ghost"
                        >
                          <Link href={`/posts/${post.id}/edit`}>
                            <Pencil />
                          </Link>
                        </Button>
                        <Button
                          aria-label={`Delete ${post.name}`}
                          className="cursor-pointer text-muted-foreground hover:text-foreground"
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
          {posts.length === 0 ? (
            <p className="px-5 py-10 text-center text-muted-foreground text-sm">
              No posts yet.
            </p>
          ) : null}
        </CardContent>
      </Card>

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
    </div>
  );
}
