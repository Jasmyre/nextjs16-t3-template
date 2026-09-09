import "server-only";

import type { PersonalAccessToken } from "@prisma/client";
import { db } from "@/server/db";

export const createTokenRecord = async (data: {
  userId: string;
  name: string;
  prefix: string;
  tokenHash: string;
  expiresAt: Date | null;
}): Promise<PersonalAccessToken> => db.personalAccessToken.create({ data });

export const listTokenRecordsByUser = async (
  userId: string
): Promise<PersonalAccessToken[]> =>
  db.personalAccessToken.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

export const getTokenRecordByPrefix = async (
  prefix: string
): Promise<PersonalAccessToken | null> =>
  db.personalAccessToken.findUnique({ where: { prefix } });

export const getTokenRecordById = async (
  id: string
): Promise<PersonalAccessToken | null> =>
  db.personalAccessToken.findUnique({ where: { id } });

export const revokeTokenRecord = async (
  id: string
): Promise<PersonalAccessToken> =>
  db.personalAccessToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
