import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostsLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-4 border-border/70 border-b px-5 py-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="space-y-0">
              {["1", "2", "3", "4", "5"].map((id) => (
                <div
                  className="flex items-center gap-4 border-border/70 border-t px-5 py-3.5"
                  key={id}
                >
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
