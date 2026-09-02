import type { RouterOutputs } from "@/trpc/react";

export type AdminUser = RouterOutputs["admin"]["listUsers"][number];
