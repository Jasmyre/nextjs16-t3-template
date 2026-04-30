"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { JSX } from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { register } from "@/actions/register";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/schemas/auth-schema";

export const SignupForm = (): JSX.Element => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>): void => {
    setSuccess("");
    setError("");

    startTransition(async () => {
      await register(values).then((data) => {
        setSuccess(data?.success);
        setError(data?.error);
      });
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input
                {...field}
                className="mt-1"
                id="name"
                placeholder="Johnny Bravo"
                type="text"
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input
                {...field}
                className="mt-1"
                id="email"
                placeholder="johndoe@example.com"
                type="email"
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <Input
                {...field}
                className="mt-1"
                id="password"
                placeholder="******"
                type="password"
              />
            </FormItem>
          )}
        />
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button
          className="w-full cursor-pointer"
          disabled={isPending}
          type="submit"
          variant={"default"}
        >
          Sign Up
        </Button>
      </form>
    </Form>
  );
};
