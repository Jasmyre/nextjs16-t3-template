import { updateRolesSchema } from "@/schemas/admin-schema";
import { createTRPCRouter, permissionProcedure } from "@/server/api/trpc";
import { listUsers, updateRoles } from "@/services/admin-service";

export const adminRouter = createTRPCRouter({
  listUsers: permissionProcedure("Admin", "manage").query(() => listUsers()),

  updateRoles: permissionProcedure("Admin", "manage")
    .input(updateRolesSchema)
    .mutation(({ ctx, input }) =>
      updateRoles({
        callerId: ctx.user.id,
        callerRoles: ctx.user.roles,
        userId: input.userId,
        roleNames: input.roleNames,
      })
    ),
});
