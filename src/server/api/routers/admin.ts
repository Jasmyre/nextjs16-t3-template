import { ADMIN_USERS_TAG, USERS_BY_ID_TAG } from "@/lib/cache-tags";
import { revalidateCacheTag } from "@/lib/db-cache";
import { updateRolesSchema } from "@/schemas/admin-schema";
import { createTRPCRouter, permissionProcedure } from "@/server/api/trpc";
import { listUsers, updateRoles } from "@/services/admin-service";

export const adminRouter = createTRPCRouter({
  listUsers: permissionProcedure("Admin", "manage").query(() => listUsers()),

  updateRoles: permissionProcedure("Admin", "manage")
    .input(updateRolesSchema)
    .mutation(async ({ ctx, input }) => {
      const updated = await updateRoles({
        callerId: ctx.user.id,
        callerRoles: ctx.user.roles,
        userId: input.userId,
        roleNames: input.roleNames,
      });
      revalidateCacheTag(ADMIN_USERS_TAG);
      revalidateCacheTag(USERS_BY_ID_TAG);
      return updated;
    }),
});
