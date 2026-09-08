import { randomBytes } from "node:crypto";
import type { PersonalAccessToken } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import "server-only";

import {
  createTokenRecord,
  getTokenRecordById,
  getTokenRecordByPrefix,
  listTokenRecordsByUser,
  revokeTokenRecord,
} from "@/data/token-repository";
import type { UserWithRoles } from "@/data/user-repository";
import { getUserById } from "@/data/user-repository";

const TOKEN_PREFIX = "pat_";
const HASH_ROUNDS = 10;
const CREATE_ATTEMPTS = 3;
const PREFIX_PATTERN = /^[0-9a-f]{8}$/;
const SECRET_PATTERN = /^[0-9a-f]{48}$/;

const toTokenPublic = (record: PersonalAccessToken) => ({
  id: record.id,
  name: record.name,
  prefix: record.prefix,
  expiresAt: record.expiresAt,
  revokedAt: record.revokedAt,
  createdAt: record.createdAt,
});

export type TokenPublic = ReturnType<typeof toTokenPublic>;

export type CreatedToken = TokenPublic & { token: string };

/**
 * Extracts the display prefix from a presented token without touching
 * storage. Returns `null` for malformed input so verification can reject
 * it before any repository lookup.
 */
export const parseTokenPrefix = (token: string): string | null => {
  if (!token.startsWith(TOKEN_PREFIX)) {
    return null;
  }

  const rest = token.slice(TOKEN_PREFIX.length);
  const separator = rest.indexOf("_");

  if (separator < 0) {
    return null;
  }

  const prefix = rest.slice(0, separator);
  const secret = rest.slice(separator + 1);

  if (!PREFIX_PATTERN.test(prefix)) {
    return null;
  }

  if (!SECRET_PATTERN.test(secret)) {
    return null;
  }

  return prefix;
};

/**
 * Creates a named token for `userId`. The plaintext secret is returned
 * exactly once — only its salted bcrypt hash is persisted.
 */
export const createToken = async ({
  userId,
  name,
  expiresAt,
}: {
  userId: string;
  name: string;
  expiresAt?: Date | null;
}): Promise<CreatedToken> => {
  for (let attempt = 0; attempt < CREATE_ATTEMPTS; attempt += 1) {
    // 24 secret bytes (48 hex chars) keep the full 61-char token under
    // bcrypt's 72-byte input limit so every character commits to the hash.
    const prefix = randomBytes(4).toString("hex");
    const secret = randomBytes(24).toString("hex");
    const token = `${TOKEN_PREFIX}${prefix}_${secret}`;
    const tokenHash = await bcrypt.hash(token, HASH_ROUNDS);

    try {
      const created = await createTokenRecord({
        userId,
        name,
        prefix,
        tokenHash,
        expiresAt: expiresAt ?? null,
      });

      return { ...toTokenPublic(created), token };
    } catch (error) {
      const isPrefixCollision =
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002";

      if (!(isPrefixCollision && attempt < CREATE_ATTEMPTS - 1)) {
        throw error;
      }
    }
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Could not generate a unique token prefix.",
  });
};

/**
 * Lists the caller's tokens. The result carries prefix/name/expiry/
 * revocation state only — never hashes or secrets.
 */
export const listTokens = async (userId: string): Promise<TokenPublic[]> => {
  const records = await listTokenRecordsByUser(userId);
  return records.map(toTokenPublic);
};

/**
 * Verifies a presented token. Revoked and expired tokens fail immediately;
 * the secret comparison uses bcrypt (salted, timing-safe). Resolves to the
 * standard user-with-roles object so permission checks apply unchanged,
 * or `null` when the token is unusable.
 */
export const verifyToken = async (
  token: string
): Promise<UserWithRoles | null> => {
  const prefix = parseTokenPrefix(token);

  if (!prefix) {
    return null;
  }

  const record = await getTokenRecordByPrefix(prefix);

  if (!record) {
    return null;
  }

  if (record.revokedAt) {
    return null;
  }

  if (record.expiresAt && record.expiresAt <= new Date()) {
    return null;
  }

  const matches = await bcrypt.compare(token, record.tokenHash);

  if (!matches) {
    return null;
  }

  return getUserById(record.userId);
};

/**
 * Revokes an owned token. Unknown ids and other users' tokens surface as
 * `NOT_FOUND` so callers cannot probe token existence. Revoking an already
 * revoked token is idempotent.
 */
export const revokeToken = async ({
  userId,
  tokenId,
}: {
  userId: string;
  tokenId: string;
}): Promise<TokenPublic> => {
  const existing = await getTokenRecordById(tokenId);

  if (!(existing && existing.userId === userId)) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Token not found.",
    });
  }

  if (existing.revokedAt) {
    return toTokenPublic(existing);
  }

  return toTokenPublic(await revokeTokenRecord(tokenId));
};
