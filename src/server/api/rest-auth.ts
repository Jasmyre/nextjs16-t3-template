import "server-only";

import type { Session } from "next-auth";
import { auth } from "@/auth";
import type { UserWithRoles } from "@/data/user-repository";
import { verifyToken } from "@/services/token-service";

/**
 * Reads the Bearer token from an Authorization header, if present.
 * Returns `null` for missing headers, non-Bearer schemes, and empty tokens.
 */
export const extractBearerToken = (headers: Headers): string | null => {
  const authorization = headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const separator = authorization.indexOf(" ");

  if (separator < 0) {
    return null;
  }

  const scheme = authorization.slice(0, separator);
  const token = authorization.slice(separator + 1).trim();

  if (scheme.toLowerCase() !== "bearer" || token === "") {
    return null;
  }

  return token;
};

const toSessionUser = (tokenUser: UserWithRoles): Session["user"] =>
  ({
    id: tokenUser.id,
    roles: tokenUser.roles.map((role) => role.name),
    emailVerified: tokenUser.emailVerified ?? new Date(),
    userName: tokenUser.userName ?? tokenUser.name,
    name: tokenUser.name,
    email: tokenUser.email,
    image: tokenUser.image,
  }) as Session["user"];

/**
 * Dual auth for the REST mount: Bearer personal access token first,
 * session-cookie fallback. A valid Bearer token wins outright; an invalid
 * or absent one falls through to `auth()` so the interactive Reference UI
 * keeps working without token setup. Resolves to the standard
 * user-with-roles shape so coarse and row-level permission checks apply
 * unchanged on both transports.
 */
export const resolveRestUser = async (
  headers: Headers
): Promise<Session["user"] | null> => {
  const bearer = extractBearerToken(headers);

  if (bearer) {
    try {
      const tokenUser = await verifyToken(bearer);

      if (tokenUser) {
        return toSessionUser(tokenUser);
      }
    } catch {
      // Fall through to the cookie session below.
    }
  }

  const session = await auth();
  return session?.user ?? null;
};

/**
 * REST context factory mirroring `createTRPCContext`'s shape (`headers`
 * plus `user`) so routers run unchanged, but with Bearer-first resolution.
 */
export const createRestContext = async (opts: {
  headers: Headers;
}): Promise<{
  headers: Headers;
  user: Session["user"] | null;
}> => ({
  headers: opts.headers,
  user: await resolveRestUser(opts.headers),
});
