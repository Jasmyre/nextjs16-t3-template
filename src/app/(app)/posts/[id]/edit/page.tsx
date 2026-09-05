import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { EditPostForm } from "@/components/edit-post-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/server";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="mb-4">
        <Button
          asChild
          className="cursor-pointer text-muted-foreground hover:text-foreground"
          size="sm"
          variant="ghost"
        >
          <Link href="/posts">
            <ArrowLeft />
            Back to Posts
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<EditFormSkeleton />}>
            <EditPostFormLoader id={postId} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}

async function EditPostFormLoader({ id }: { id: number }) {
  const post = await api.post.getById({ id });

  return <EditPostForm post={{ id: post.id, name: post.name }} />;
}

function EditFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  );
}
