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
    <main className="mx-auto w-full max-w-7xl px-4 py-10">
      <Card>
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
