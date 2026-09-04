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
    <main className="container mx-auto max-w-7xl px-4 py-8">
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
