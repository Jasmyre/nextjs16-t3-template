import "server-only";

import { getDashboardStats } from "@/data/dashboard-repository";

export interface DashboardStats {
  myPosts: number;
  totalPosts: number;
  totalUsers: number;
}

export const getStats = async (userId: string): Promise<DashboardStats> =>
  getDashboardStats(userId);
