import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostsLoading() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-28 shrink-0" />
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
