"use server";

import bcrypt from "bcryptjs";
import type * as z from "zod";

import { getUserByEmail } from "@/data/user";
import { registerSchema } from "@/schemas/auth-schema";
import { db } from "@/server/db";

export const register = async (values: z.infer<typeof registerSchema>) => {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { name, email, password } = validatedFields.data as z.infer<
    typeof registerSchema
  >;

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "User already exist!" };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // TODO: Send verification email

  return { success: "User created!" };
};
