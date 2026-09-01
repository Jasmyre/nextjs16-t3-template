import type { RoleName } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { Session } from "next-auth";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createCaller } from "@/server/api/root";

const {
  greetMock,
  createMock,
  getLatestMock,
  getByIdMock,
  updateMock,
  removeMock,
} = vi.hoisted(() => ({
  greetMock: vi.fn(),
  createMock: vi.fn(),
  getLatestMock: vi.fn(),
  getByIdMock: vi.fn(),
  updateMock: vi.fn(),
  removeMock: vi.fn(),
}));

vi.mock("@/services/post-service", () => ({
  greet: greetMock,
  create: createMock,
  getLatest: getLatestMock,
  getById: getByIdMock,
  update: updateMock,
  remove: removeMock,
}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/redis", () => ({
  redis: {},
}));

const makeUser = (id: string, roles: RoleName[]): Session["user"] => ({
  id,
  roles,
  userName: `user-${id}`,
  emailVerified: new Date(),
});

const ownPost = { id: 1, name: "My post", authorId: "user-1" };
const otherPost = { id: 2, name: "Their post", authorId: "user-2" };

describe("post router", () => {
  let caller: ReturnType<typeof createCaller>;
  let authedCaller: ReturnType<typeof createCaller>;
  let moderatorCaller: ReturnType<typeof createCaller>;
  let adminCaller: ReturnType<typeof createCaller>;

  beforeAll(() => {
    vi.stubEnv("NODE_ENV", "production");
    caller = createCaller({ headers: new Headers(), user: null });
    authedCaller = createCaller({
      headers: new Headers(),
      user: makeUser("user-1", ["USER"]),
    });
    moderatorCaller = createCaller({
      headers: new Headers(),
      user: makeUser("user-4", ["MODERATOR"]),
    });
    adminCaller = createCaller({
      headers: new Headers(),
      user: makeUser("user-3", ["ADMIN"]),
    });
  });

  beforeEach(() => {
    greetMock.mockReset();
    createMock.mockReset();
    getLatestMock.mockReset();
    getByIdMock.mockReset();
    updateMock.mockReset();
    removeMock.mockReset();
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

  describe("create", () => {
    it("delegates creation with the session user as author", async () => {
      createMock.mockResolvedValue(ownPost);
      const result = await authedCaller.post.create({ name: "My post" });
      expect(result).toEqual(ownPost);
      expect(createMock).toHaveBeenCalledWith("My post", "user-1");
    });

    it("rejects a create mutation with an empty name", async () => {
      await expect(
        authedCaller.post.create({ name: "" })
      ).rejects.toBeInstanceOf(TRPCError);
      expect(createMock).not.toHaveBeenCalled();
    });

    it("rejects an unauthenticated create", async () => {
      await expect(
        caller.post.create({ name: "My post" })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(createMock).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("lets the owner update their own post", async () => {
      getByIdMock.mockResolvedValue(ownPost);
      updateMock.mockResolvedValue({ ...ownPost, name: "Renamed" });
      const result = await authedCaller.post.update({
        id: 1,
        name: "Renamed",
      });
      expect(result).toEqual({ ...ownPost, name: "Renamed" });
      expect(updateMock).toHaveBeenCalledWith(1, "Renamed");
    });

    it("forbids an update of another user's post", async () => {
      getByIdMock.mockResolvedValue(otherPost);
      await expect(
        authedCaller.post.update({ id: 2, name: "Hijacked" })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(updateMock).not.toHaveBeenCalled();
    });

    it("forbids an update when the post does not exist", async () => {
      getByIdMock.mockResolvedValue(null);
      await expect(
        authedCaller.post.update({ id: 404, name: "Ghost" })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(updateMock).not.toHaveBeenCalled();
    });

    it("lets a moderator update any post", async () => {
      getByIdMock.mockResolvedValue(otherPost);
      updateMock.mockResolvedValue({ ...otherPost, name: "Moderated" });
      const result = await moderatorCaller.post.update({
        id: 2,
        name: "Moderated",
      });
      expect(result).toEqual({ ...otherPost, name: "Moderated" });
    });

    it("lets an admin update any post", async () => {
      getByIdMock.mockResolvedValue(otherPost);
      updateMock.mockResolvedValue({ ...otherPost, name: "Edited" });
      const result = await adminCaller.post.update({ id: 2, name: "Edited" });
      expect(result).toEqual({ ...otherPost, name: "Edited" });
    });

    it("rejects an unauthenticated update", async () => {
      await expect(
        caller.post.update({ id: 1, name: "Nope" })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(updateMock).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("lets the owner delete their own post", async () => {
      getByIdMock.mockResolvedValue(ownPost);
      removeMock.mockResolvedValue(ownPost);
      const result = await authedCaller.post.delete({ id: 1 });
      expect(result).toEqual(ownPost);
      expect(removeMock).toHaveBeenCalledWith(1);
    });

    it("forbids a non-owner from deleting another user's post", async () => {
      getByIdMock.mockResolvedValue(otherPost);
      await expect(authedCaller.post.delete({ id: 2 })).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
      expect(removeMock).not.toHaveBeenCalled();
    });

    it("forbids a moderator from deleting another user's post", async () => {
      getByIdMock.mockResolvedValue(otherPost);
      await expect(
        moderatorCaller.post.delete({ id: 2 })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(removeMock).not.toHaveBeenCalled();
    });

    it("lets a moderator delete their own post", async () => {
      getByIdMock.mockResolvedValue({ ...ownPost, authorId: "user-4" });
      removeMock.mockResolvedValue({ ...ownPost, authorId: "user-4" });
      const result = await moderatorCaller.post.delete({ id: 1 });
      expect(result).toEqual({ ...ownPost, authorId: "user-4" });
      expect(removeMock).toHaveBeenCalledWith(1);
    });

    it("forbids a delete when the post does not exist", async () => {
      getByIdMock.mockResolvedValue(null);
      await expect(authedCaller.post.delete({ id: 404 })).rejects.toMatchObject(
        { code: "FORBIDDEN" }
      );
      expect(removeMock).not.toHaveBeenCalled();
    });

    it("lets an admin delete any post", async () => {
      getByIdMock.mockResolvedValue(otherPost);
      removeMock.mockResolvedValue(otherPost);
      const result = await adminCaller.post.delete({ id: 2 });
      expect(result).toEqual(otherPost);
    });

    it("rejects an unauthenticated delete", async () => {
      await expect(caller.post.delete({ id: 1 })).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
      expect(removeMock).not.toHaveBeenCalled();
    });
  });

  it("returns the latest post from the service", async () => {
    getLatestMock.mockResolvedValue(otherPost);
    const result = await caller.post.getLatest();
    expect(result).toEqual(otherPost);
  });
});
