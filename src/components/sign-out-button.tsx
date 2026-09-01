"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { Button } from "./ui/button";

export const SignOutButton = ({ leading }: { leading?: ReactNode }) => (
  <Button
    className="flex w-full cursor-pointer items-center"
    onClick={() => signOut({ callbackUrl: DEFAULT_LOGIN_REDIRECT })}
    variant="ghost"
  >
    {leading}
    <LogOut className="mr-2 h-4 w-4 transition-transform duration-200" />
    <span>Log out</span>
  </Button>
);
