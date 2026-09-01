import type { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import bcrypt from "bcryptjs";
import "server-only";

import { createUser, getUserByEmail } from "@/data/user-repository";

const DEFAULT_ROLE = "USER" as const;

export type RegisterResult =
  | { ok: true; userId: string }
  | { ok: false; code: "EMAIL_IN_USE" };

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResult> => {
  const existingUser = await getUserByEmail(data.email);

  if (existingUser) {
    return { ok: false, code: "EMAIL_IN_USE" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  try {
    const user = await createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      roles: { connect: { name: DEFAULT_ROLE } },
    });

    return { ok: true, userId: user.id };
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, code: "EMAIL_IN_USE" };
    }

    throw error;
  }
};

export const verifyCredentials = async (
  email: string,
  password: string
): Promise<User | null> => {
  const user = await getUserByEmail(email);

  if (!user?.password) {
    return null;
  }

  const passwordsMatch = await bcrypt.compare(password, user.password);

  return passwordsMatch ? user : null;
};
