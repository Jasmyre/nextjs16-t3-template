import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditPostLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="mb-4">
        <Skeleton className="h-7 w-24" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
