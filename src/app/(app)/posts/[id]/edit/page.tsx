import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { EditPostForm } from "@/components/edit-post-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardDescription>
            <Button
              asChild
              className="mb-1 -ml-2 cursor-pointer"
              size="sm"
              variant="ghost"
            >
              <Link href="/posts">
                <ArrowLeft />
                Back to Posts
              </Link>
            </Button>
          </CardDescription>
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
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
