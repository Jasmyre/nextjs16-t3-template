"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { FormError } from "@/components/form-error";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createPostSchema } from "@/schemas/post-schema";
import { api } from "@/trpc/react";

const POSTS_PATH = "/posts";

export function PostCreateForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const utils = api.useUtils();
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.post.list.invalidate(),
        utils.dashboard.getStats.invalidate(),
      ]);
      router.push(POSTS_PATH);
    },
    onError: (error) => {
      setFormError(error.message);
    },
  });

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof createPostSchema>): void => {
    setFormError(undefined);
    createPost.mutate(values);
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Post title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormError message={formError} />
        <div className="flex items-center justify-between gap-3">
          <Button
            asChild
            className="cursor-pointer text-muted-foreground hover:text-foreground"
            size="sm"
            type="button"
            variant="ghost"
          >
            <Link href={POSTS_PATH}>Back to Posts</Link>
          </Button>
          <Button
            className="cursor-pointer"
            disabled={createPost.isPending}
            type="submit"
          >
            <Pencil />
            Create Post
          </Button>
        </div>
      </form>
    </Form>
  );
}
