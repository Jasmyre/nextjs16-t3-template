import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PostsPage() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
          <CardDescription>Your posts will land here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This placeholder will become a full post list with actions.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
