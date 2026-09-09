import { dashboardStatsOutputSchema } from "@/schemas/dashboard-schema";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { getStats } from "@/services/dashboard-service";

export const dashboardRouter = createTRPCRouter({
  getStats: privateProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/api/v1/dashboard/stats",
        tags: ["dashboard"],
        summary: "Fetch dashboard aggregate counts",
        protect: true,
      },
    })
    .output(dashboardStatsOutputSchema)
    .query(({ ctx }) => getStats(ctx.user.id)),
});
