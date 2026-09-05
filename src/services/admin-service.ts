import type { RoleName } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import "server-only";

import { getAllUsers, updateUserRoles } from "@/data/user-repository";

export const listUsers = async () => await getAllUsers();

export const updateRoles = async ({
  callerId,
  callerRoles,
  userId,
  roleNames,
}: {
  callerId: string;
  callerRoles: RoleName[];
  userId: string;
  roleNames: RoleName[];
}) => {
  if (roleNames.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "A user must have at least one role.",
    });
  }

  const callerIsAdmin = callerRoles.includes("ADMIN");
  const isRemovingOwnAdmin =
    userId === callerId && callerIsAdmin && !roleNames.includes("ADMIN");

  if (isRemovingOwnAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You cannot remove your own ADMIN role.",
    });
  }

  return await updateUserRoles(userId, roleNames);
};
