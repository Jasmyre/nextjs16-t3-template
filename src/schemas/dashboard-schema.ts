import { z } from "zod";

/**
 * Shared strict output contract for the dashboard stats Operation.
 * Plain counts only — no dates, no unknowns (strict, so drift fails loudly).
 */
export const dashboardStatsOutputSchema = z.strictObject({
  totalUsers: z.number().int().nonnegative(),
  totalPosts: z.number().int().nonnegative(),
  myPosts: z.number().int().nonnegative(),
});
