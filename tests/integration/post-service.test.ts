import type { RoleName } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { registerUser } from "@/services/auth-service";
import {
  create,
  getById,
  getByIdWithAuthor,
  getLatest,
  greet,
  list,
  remove,
  update,
} from "@/services/post-service";
import { testDb } from "./db";
import { integrationEnabled } from "./setup";

const describeDb = integrationEnabled ? describe : describe.skip;

const assignRole = async (
  userId: string,
  roleName: RoleName
): Promise<void> => {
  await testDb?.user.update({
    where: { id: userId },
    data: { roles: { connect: { name: roleName } } },
  });
};

const registerAs = async (
  roleName: RoleName,
  email: string
): Promise<string> => {
  const registration = await registerUser({
    name: `Role ${roleName}`,
    email,
    password: "secret123",
  });
  if (!registration.ok) {
    throw new Error("expected registration to succeed");
  }
  await assignRole(registration.userId, roleName);
  return registration.userId;
};

describeDb("post-service integration", () => {
  it("creates a post recording the author and retrieves it as the latest", async () => {
    const registration = await registerUser({
      name: "Post Author",
      email: "post-author@example.com",
      password: "secret123",
    });
    expect(registration.ok).toBe(true);
    if (!registration.ok) {
      return;
    }

    const post = await create("First post", registration.userId);
    expect(post.name).toBe("First post");
    expect(post.authorId).toBe(registration.userId);
    expect(post.id).toBeTypeOf("number");

    const latest = await getLatest();
    expect(latest).not.toBeNull();
    if (latest) {
      expect(latest.name).toBe("First post");
      expect(latest.authorId).toBe(registration.userId);
    }
  });

  it("updates a post name", async () => {
    const registration = await registerUser({
      name: "Updater",
      email: "updater@example.com",
      password: "secret123",
    });
    if (!registration.ok) {
      return;
    }

    const post = await create("Original", registration.userId);
    const updated = await update(post.id, "Renamed");
    expect(updated.name).toBe("Renamed");

    const fetched = await getById(post.id);
    expect(fetched?.name).toBe("Renamed");
  });

  it("deletes a post", async () => {
    const registration = await registerUser({
      name: "Deleter",
      email: "deleter@example.com",
      password: "secret123",
    });
    if (!registration.ok) {
      return;
    }

    const post = await create("Doomed", registration.userId);
    await remove(post.id);
    expect(await getById(post.id)).toBeNull();
  });

  it("returns the most recently created post from getLatest", async () => {
    const registration = await registerUser({
      name: "Sequencer",
      email: "sequencer@example.com",
      password: "secret123",
    });
    if (!registration.ok) {
      return;
    }

    await create("older post", registration.userId);
    const newest = await create("newer post", registration.userId);

    const latest = await getLatest();
    expect(latest?.name).toBe(newest.name);
  });

  it("returns null from getLatest when there are no posts", async () => {
    const latest = await getLatest();
    expect(latest).toBeNull();
  });

  it("returns only the caller's own posts for a USER", async () => {
    const [me, other] = await Promise.all([
      registerAs("USER", "list-user@example.com"),
      registerAs("USER", "list-other@example.com"),
    ]);

    await Promise.all([
      create("my post", me),
      create("my second post", me),
      create("their post", other),
    ]);

    const posts = await list({ id: me, roles: ["USER"] });
    expect(posts.map((p) => p.name).sort()).toEqual([
      "my post",
      "my second post",
    ]);
  });

  it("returns all posts for a MODERATOR", async () => {
    const [me, other] = await Promise.all([
      registerAs("MODERATOR", "list-moderator@example.com"),
      registerAs("USER", "list-moderator-other@example.com"),
    ]);

    await Promise.all([create("my post", me), create("their post", other)]);

    const posts = await list({ id: me, roles: ["MODERATOR"] });
    expect(posts.map((p) => p.name).sort()).toEqual(["my post", "their post"]);
  });

  it("returns all posts for an ADMIN", async () => {
    const [me, other] = await Promise.all([
      registerAs("ADMIN", "list-admin@example.com"),
      registerAs("USER", "list-admin-other@example.com"),
    ]);

    await Promise.all([create("my post", me), create("their post", other)]);

    const posts = await list({ id: me, roles: ["ADMIN"] });
    expect(posts.map((p) => p.name).sort()).toEqual(["my post", "their post"]);
  });

  it("includes the author name on every listed post", async () => {
    const me = await registerAs("USER", "list-author-name@example.com");
    await create("named post", me);

    const posts = await list({ id: me, roles: ["USER"] });
    expect(posts).toHaveLength(1);
    expect(posts[0]?.author.name).toBe("Role USER");
  });

  it("returns a single post including its author name", async () => {
    const me = await registerAs("USER", "get-by-id-author@example.com");
    const post = await create("single post", me);

    const fetched = await getByIdWithAuthor(post.id);
    expect(fetched?.name).toBe("single post");
    expect(fetched?.author.name).toBe("Role USER");
  });

  it("returns null from getByIdWithAuthor when the post does not exist", async () => {
    expect(await getByIdWithAuthor(999_999)).toBeNull();
  });
});

describe("post-service greet", () => {
  it("returns a greeting for a given text", () => {
    expect(greet("world")).toBe("Hello world");
  });
});
