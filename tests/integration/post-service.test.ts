import { describe, expect, it } from "vitest";
import { registerUser } from "@/services/auth-service";
import {
  create,
  getById,
  getLatest,
  greet,
  remove,
  update,
} from "@/services/post-service";
import { integrationEnabled } from "./setup";

const describeDb = integrationEnabled ? describe : describe.skip;

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
});

describe("post-service greet", () => {
  it("returns a greeting for a given text", () => {
    expect(greet("world")).toBe("Hello world");
  });
});
