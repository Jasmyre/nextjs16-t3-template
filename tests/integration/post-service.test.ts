import { describe, expect, it } from "vitest";
import { create, getLatest, greet } from "@/services/post-service";
import { integrationEnabled } from "./setup";

const describeDb = integrationEnabled ? describe : describe.skip;

describeDb("post-service integration", () => {
  it("creates a post and retrieves it as the latest", async () => {
    const post = await create("First post");
    expect(post.name).toBe("First post");
    expect(post.id).toBeTypeOf("number");

    const latest = await getLatest();
    expect(latest).not.toBeNull();
    if (latest) {
      expect(latest.name).toBe("First post");
    }
  });

  it("returns the most recently created post from getLatest", async () => {
    await create("older post");
    const newest = await create("newer post");

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
