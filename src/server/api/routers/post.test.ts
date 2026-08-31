import { TRPCError } from "@trpc/server";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createCaller } from "@/server/api/root";

const { greetMock, createMock, getLatestMock } = vi.hoisted(() => ({
  greetMock: vi.fn(),
  createMock: vi.fn(),
  getLatestMock: vi.fn(),
}));

vi.mock("@/services/post-service", () => ({
  greet: greetMock,
  create: createMock,
  getLatest: getLatestMock,
}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/redis", () => ({
  redis: {},
}));

describe("post router", () => {
  let caller: ReturnType<typeof createCaller>;

  beforeAll(() => {
    vi.stubEnv("NODE_ENV", "production");
    caller = createCaller({ headers: new Headers(), user: null });
  });

  beforeEach(() => {
    greetMock.mockReset();
    createMock.mockReset();
    getLatestMock.mockReset();
  });

  it("returns a greeting for the hello query", async () => {
    greetMock.mockReturnValue("Hello World");
    const result = await caller.post.hello({ text: "World" });
    expect(result).toEqual({ greeting: "Hello World" });
  });

  it("rejects a hello query with an unknown field", async () => {
    await expect(
      // @ts-expect-error - testing invalid input shape
      caller.post.hello({ unknown: true })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("delegates creation to the service with the given name", async () => {
    const created = { id: 1, name: "My post" };
    createMock.mockResolvedValue(created);
    const result = await caller.post.create({ name: "My post" });
    expect(result).toEqual(created);
    expect(createMock).toHaveBeenCalledWith("My post");
  });

  it("rejects a create mutation with an empty name", async () => {
    await expect(caller.post.create({ name: "" })).rejects.toBeInstanceOf(
      TRPCError
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns the latest post from the service", async () => {
    const latest = { id: 2, name: "Latest post" };
    getLatestMock.mockResolvedValue(latest);
    const result = await caller.post.getLatest();
    expect(result).toEqual(latest);
  });
});
