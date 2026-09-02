import { RoleName } from "@prisma/client";
import z from "zod";

export const updateRolesSchema = z.object({
  userId: z.string().min(1),
  roleNames: z.array(z.nativeEnum(RoleName)),
});
