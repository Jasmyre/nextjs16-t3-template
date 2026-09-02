import "server-only";

import type { RoleName } from "@prisma/client";

export interface PermissionUser {
  id: string;
  roles: RoleName[];
}

export type ResourceName = "Post" | "Admin";
export type PermissionAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "manage";

export interface PostData {
  authorId: string;
}

export interface AdminData {
  userId: string;
}

export type ResourceData<R extends ResourceName> = R extends "Post"
  ? PostData
  : R extends "Admin"
    ? AdminData
    : never;

export type PermissionRule<R extends ResourceName> =
  | boolean
  | ((user: PermissionUser, data: ResourceData<R>) => boolean);

export type PermissionDefinition<R extends ResourceName> = Partial<
  Record<PermissionAction, PermissionRule<R>>
>;

const ownsPost = (user: PermissionUser, data: PostData): boolean =>
  data.authorId === user.id;

const POST_PERMISSIONS: Record<RoleName, PermissionDefinition<"Post">> = {
  ADMIN: { view: true, create: true, update: true, delete: true },
  MODERATOR: { view: true, create: true, update: true, delete: ownsPost },
  USER: { view: true, create: true, update: ownsPost, delete: ownsPost },
};

const ADMIN_PERMISSIONS: Record<RoleName, PermissionDefinition<"Admin">> = {
  ADMIN: { manage: true },
  MODERATOR: {},
  USER: {},
};

type PermissionMatrix = {
  [R in ResourceName]: Record<RoleName, PermissionDefinition<R>>;
};

export const PERMISSIONS: PermissionMatrix = {
  Post: POST_PERMISSIONS,
  Admin: ADMIN_PERMISSIONS,
};

export const hasPermission = <R extends ResourceName>(
  user: PermissionUser,
  resource: R,
  action: PermissionAction,
  data?: ResourceData<R>
): boolean => {
  for (const role of user.roles) {
    const rule = PERMISSIONS[resource][role]?.[action];

    if (rule === undefined) {
      continue;
    }

    if (typeof rule === "boolean") {
      if (rule) {
        return true;
      }

      continue;
    }

    if (data !== undefined && rule(user, data)) {
      return true;
    }
  }

  return false;
};

/**
 * Coarse precheck: does any held role grant this action at all? Predicate rules
 * count as grants here because row-level authorization happens separately once
 * the record is available.
 */
export const hasActionGrant = (
  user: PermissionUser,
  resource: ResourceName,
  action: PermissionAction
): boolean => {
  for (const role of user.roles) {
    const rule = PERMISSIONS[resource][role]?.[action];

    if (rule === undefined) {
      continue;
    }

    if (typeof rule === "boolean") {
      if (rule) {
        return true;
      }

      continue;
    }

    return true;
  }

  return false;
};
