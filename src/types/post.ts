import type { RouterOutputs } from "@/trpc/react";

export type PostListItem = RouterOutputs["post"]["list"][number];
