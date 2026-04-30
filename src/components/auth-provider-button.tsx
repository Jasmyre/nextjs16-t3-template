"use client";

import { signIn } from "next-auth/react";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { Button } from "./ui/button";

type Provider = Parameters<typeof signIn>[0];

const ProviderButton = ({
  children,
  ...props
}: ComponentProps<typeof Button> & { children: ReactNode }) => (
  <Button
    {...props}
    className="relative flex w-full cursor-pointer justify-center"
    variant="secondary"
  >
    {children}
  </Button>
);

type AuthProviderButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  provider: Provider;
  icon: ReactNode;
  label: string;
};

export const AuthProviderButton = ({
  provider,
  icon,
  label,
  ...props
}: AuthProviderButtonProps) => {
  const handleClick = () => {
    signIn(provider, {
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  };

  return (
    <ProviderButton onClick={handleClick} {...props}>
      <span className="absolute top-1/2 left-8 -translate-x-1/2 -translate-y-1/2">
        {icon}
      </span>
      <span>{label}</span>
    </ProviderButton>
  );
};
