import "server-only";

import type { User } from "@prisma/client";
import { db } from "@/server/db";

export const getUserByEmail = async (email: string): Promise<User | null> =>
  db.user.findUnique({
    where: { email },
  });

export const getUserById = async (id: string): Promise<User | null> =>
  db.user.findUnique({
    where: { id },
  });

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> =>
  db.user.create({
    data,
  });

export const updateEmailVerification = async (userId: string): Promise<User> =>
  db.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
