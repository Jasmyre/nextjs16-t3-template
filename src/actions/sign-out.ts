"use server";

import { signOut } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const signout = async () => {
  await signOut({ redirectTo: DEFAULT_LOGIN_REDIRECT });
};
