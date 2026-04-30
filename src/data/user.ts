import type { User } from "@prisma/client";
import { db } from "@/server/db";

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserById = async (id: string | null): Promise<User | null> => {
  try {
    if (id === null) {
      throw new Error("User does not exist");
    }

    const user = await db.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};
