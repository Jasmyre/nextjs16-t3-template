import { PostCreateForm } from "@/components/post-create-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewPostPage() {
  return (
    <main
      className="mx-auto w-full max-w-7xl px-4 py-10"
      data-testid="new-post-shell"
    >
      <Card data-testid="new-post-content">
        <CardHeader>
          <CardTitle>New Post</CardTitle>
          <CardDescription>Create a new post.</CardDescription>
        </CardHeader>
        <CardContent>
          <PostCreateForm />
        </CardContent>
      </Card>
    </main>
  );
}
