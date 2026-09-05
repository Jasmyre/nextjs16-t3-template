import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[5.5rem] rounded-xl" />
          <Skeleton className="h-[5.5rem] rounded-xl" />
          <Skeleton className="h-[5.5rem] rounded-xl" />
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4 px-5">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-7 w-16" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {["1", "2", "3", "4", "5"].map((id) => (
                <div
                  className="flex items-center justify-between gap-4 border-border/70 border-t px-5 py-3.5"
                  key={id}
                >
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
