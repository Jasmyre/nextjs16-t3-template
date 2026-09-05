import { PostList } from "@/components/post-list";
import { api, HydrateClient } from "@/trpc/server";

export default async function PostsPage() {
  await api.post.list.prefetch();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10">
      <HydrateClient>
        <PostList />
      </HydrateClient>
    </main>
  );
}
