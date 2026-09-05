"use client";

import { Activity, FileText, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
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

const NEW_POST_PATH = "/posts/new";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1.5 font-semibold text-2xl tabular-nums tracking-tight">
            {value}
          </p>
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const [stats] = api.dashboard.getStats.useSuspenseQuery();
  const [recentPosts] = api.post.list.useSuspenseQuery();

  return (
    <div className="fade-in-0 flex animate-in flex-col gap-6 duration-200 ease-out motion-reduce:animate-none">
      <PageHeader
        description="An overview of your account and posts."
        title="Dashboard"
      >
        <Button asChild>
          <Link href={NEW_POST_PATH}>New Post</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Users className="size-4" />}
          label="Total Users"
          value={stats.totalUsers}
        />
        <StatCard
          icon={<FileText className="size-4" />}
          label="Total Posts"
          value={stats.totalPosts}
        />
        <StatCard
          icon={<Activity className="size-4" />}
          label="My Posts"
          value={stats.myPosts}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 px-5">
          <div className="flex flex-col gap-1">
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Most recent posts you can see.</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/posts">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentPosts.length === 0 ? (
            <p className="px-5 py-10 text-center text-muted-foreground text-sm">
              You have no posts yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/70">
              {recentPosts.slice(0, 5).map((post) => (
                <li
                  className="group/item flex items-center justify-between gap-4 px-5 py-3.5 transition-colors duration-150 ease-ui hover:bg-muted/50"
                  key={post.id}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">{post.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                  <Link
                    className="shrink-0 font-medium text-muted-foreground text-xs transition-colors duration-150 ease-ui hover:text-foreground"
                    href={`/posts/${post.id}/edit`}
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
