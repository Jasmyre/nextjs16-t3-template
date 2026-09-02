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
