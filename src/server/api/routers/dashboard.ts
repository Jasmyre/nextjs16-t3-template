import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { getStats } from "@/services/dashboard-service";

export const dashboardRouter = createTRPCRouter({
  getStats: privateProcedure.query(({ ctx }) => getStats(ctx.user.id)),
});
