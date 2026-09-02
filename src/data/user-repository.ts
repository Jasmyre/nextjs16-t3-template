import "server-only";

import type { Role, RoleName, User } from "@prisma/client";
import { db } from "@/server/db";

export type UserWithRoles = User & { roles: Role[] };

const withRoles = {
  roles: true,
} as const;

const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  roles: true,
} as const;

export const getUserByEmail = async (
  email: string
): Promise<UserWithRoles | null> =>
  db.user.findUnique({
    where: { email },
    include: withRoles,
  });

export const getUserById = async (id: string): Promise<UserWithRoles | null> =>
  db.user.findUnique({
    where: { id },
    include: withRoles,
  });

export const getAllUsers = async () =>
  db.user.findMany({
    select: adminUserSelect,
    orderBy: { createdAt: "asc" },
  });

export const updateUserRoles = async (userId: string, roleNames: RoleName[]) =>
  db.user.update({
    where: { id: userId },
    data: {
      roles: {
        set: roleNames.map((name) => ({ name })),
      },
    },
    select: adminUserSelect,
  });

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  roles?: { connect: { name: RoleName } };
}): Promise<User> =>
  db.user.create({
    data,
  });

export const updateEmailVerification = async (userId: string): Promise<User> =>
  db.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
