import { PostList } from "@/components/post-list";
import { api, HydrateClient } from "@/trpc/server";

export default async function PostsPage() {
  await api.post.list.prefetch();

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
      <HydrateClient>
        <PostList />
      </HydrateClient>
    </main>
  );
}
