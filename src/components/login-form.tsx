"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type JSX, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { login } from "@/actions/login";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LogInSchema } from "@/schemas/auth-schema";

export const LogInForm = (): JSX.Element => {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);

  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider!"
      : "";

  const form = useForm<z.infer<typeof LogInSchema>>({
    resolver: zodResolver(LogInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LogInSchema>): void => {
    setSuccess("");
    setError("");

    startTransition(async () => {
      await login(values).then((data) => {
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
              <div className="relative mt-1">
                <Input
                  {...field}
                  className="pr-10"
                  id="password"
                  placeholder="******"
                  type={showPassword ? "text" : "password"}
                />
                <Button
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  disabled={isPending}
                  onClick={() => setShowPassword((prev) => !prev)}
                  type="button"
                  variant="ghost"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </FormItem>
          )}
        />
        <FormError message={error ?? urlError} />
        <FormSuccess message={success} />
        <Button
          className="w-full cursor-pointer"
          disabled={isPending}
          type="submit"
          variant={"default"}
        >
          Sign In
        </Button>
      </form>
    </Form>
  );
};
