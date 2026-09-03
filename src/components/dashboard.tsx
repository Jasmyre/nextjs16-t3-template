"use client";

import { Activity, FileText, Users } from "lucide-react";
import Link from "next/link";
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
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-foreground">
          {icon}
        </div>
        <div>
          <p className="font-medium text-muted-foreground text-sm">{label}</p>
          <p className="mt-0.5 font-semibold text-3xl tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const [stats] = api.dashboard.getStats.useSuspenseQuery();
  const [recentPosts] = api.post.list.useSuspenseQuery();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-2xl">Dashboard</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            An overview of your account and posts.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href={NEW_POST_PATH}>New Post</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Users"
          value={stats.totalUsers}
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Total Posts"
          value={stats.totalPosts}
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="My Posts"
          value={stats.myPosts}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Most recent posts you can see.</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/posts">View all</Link>
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
                    Created
                  </th>
                  <th className="px-4 py-3 text-right font-medium" scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {recentPosts.slice(0, 5).map((post) => (
                  <tr className="hover:bg-muted/40" key={post.id}>
                    <td className="px-4 py-3 font-medium">{post.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/posts/${post.id}/edit`}>Edit</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {recentPosts.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-muted-foreground"
                      colSpan={3}
                    >
                      You have no posts yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
