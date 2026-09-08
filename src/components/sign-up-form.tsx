"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { signUp } from "@/actions/sign-up";
import { FormNotice } from "@/components/form-notice";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SignUpSchema } from "@/schemas/auth-schema";

export const SignUpForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof SignUpSchema>): void => {
    setSuccess("");
    setError("");

    startTransition(async () => {
      await signUp(values).then((data) => {
        setSuccess(data?.success);
        setError(data?.error);
      });
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet>
        <FieldGroup>
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Name:</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    disabled={isPending}
                    placeholder="Johnny Bravo"
                    type="text"
                  />
                </InputGroup>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Email:</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    disabled={isPending}
                    placeholder="johndoe@example.com"
                    type="email"
                  />
                </InputGroup>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Password:</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    disabled={isPending}
                    placeholder={showPassword ? "Your password" : "******"}
                    type={showPassword ? "text" : "password"}
                  />
                  <InputGroupAddon align={"inline-end"}>
                    <Button
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="p-0"
                      disabled={isPending}
                      onClick={() => setShowPassword((previous) => !previous)}
                      size={"icon"}
                      title={showPassword ? "Hide password" : "Show password"}
                      type="button"
                      variant={"ghost"}
                    >
                      {showPassword ? <Eye /> : <EyeOff />}
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <FormNotice error={error} success={success} />

          <Field>
            <ButtonGroup>
              <Button
                className="w-full cursor-pointer"
                disabled={isPending}
                type="submit"
                variant={"default"}
              >
                Sign Up
              </Button>
            </ButtonGroup>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};
