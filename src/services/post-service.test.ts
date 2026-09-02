import type { RoleName } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PermissionUser } from "@/server/permissions";

const {
  listAllPostsMock,
  listPostsByAuthorMock,
  getPostByIdMock,
  getPostByIdWithAuthorMock,
} = vi.hoisted(() => ({
  listAllPostsMock: vi.fn(),
  listPostsByAuthorMock: vi.fn(),
  getPostByIdMock: vi.fn(),
  getPostByIdWithAuthorMock: vi.fn(),
}));

vi.mock("@/data/post-repository", () => ({
  listAllPosts: listAllPostsMock,
  listPostsByAuthor: listPostsByAuthorMock,
  getPostById: getPostByIdMock,
  getPostByIdWithAuthor: getPostByIdWithAuthorMock,
}));

import { getById, getByIdWithAuthor, list } from "@/services/post-service";

const user = (id: string, roles: RoleName[]): PermissionUser => ({ id, roles });

const ownPost = { id: 1, name: "My post", authorId: "user-1" };
const otherPost = { id: 2, name: "Their post", authorId: "user-2" };
const ownPostWithAuthor = { ...ownPost, author: { name: "My name" } };
const otherPostWithAuthor = { ...otherPost, author: { name: "Their name" } };

describe("post service", () => {
  beforeEach(() => {
    listAllPostsMock.mockReset();
    listPostsByAuthorMock.mockReset();
    getPostByIdMock.mockReset();
    getPostByIdWithAuthorMock.mockReset();
  });

  describe("list", () => {
    it("returns all posts for an ADMIN user", async () => {
      listAllPostsMock.mockResolvedValue([
        ownPostWithAuthor,
        otherPostWithAuthor,
      ]);
      const result = await list(user("admin-1", ["ADMIN"]));
      expect(result).toEqual([ownPostWithAuthor, otherPostWithAuthor]);
      expect(listAllPostsMock).toHaveBeenCalledOnce();
      expect(listPostsByAuthorMock).not.toHaveBeenCalled();
    });

    it("returns all posts for a MODERATOR user", async () => {
      listAllPostsMock.mockResolvedValue([
        ownPostWithAuthor,
        otherPostWithAuthor,
      ]);
      const result = await list(user("mod-1", ["MODERATOR"]));
      expect(result).toEqual([ownPostWithAuthor, otherPostWithAuthor]);
      expect(listAllPostsMock).toHaveBeenCalledOnce();
      expect(listPostsByAuthorMock).not.toHaveBeenCalled();
    });

    it("returns only the user's own posts for a USER role", async () => {
      listPostsByAuthorMock.mockResolvedValue([ownPostWithAuthor]);
      const result = await list(user("user-1", ["USER"]));
      expect(result).toEqual([ownPostWithAuthor]);
      expect(listPostsByAuthorMock).toHaveBeenCalledWith("user-1");
      expect(listAllPostsMock).not.toHaveBeenCalled();
    });

    it("returns only the user's own posts when roles array is empty", async () => {
      listPostsByAuthorMock.mockResolvedValue([]);
      const result = await list(user("user-1", []));
      expect(result).toEqual([]);
      expect(listPostsByAuthorMock).toHaveBeenCalledWith("user-1");
      expect(listAllPostsMock).not.toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("delegates to the repository returning the post", async () => {
      getPostByIdMock.mockResolvedValue(ownPost);
      const result = await getById(1);
      expect(result).toEqual(ownPost);
      expect(getPostByIdMock).toHaveBeenCalledWith(1);
    });

    it("returns null when the post does not exist", async () => {
      getPostByIdMock.mockResolvedValue(null);
      const result = await getById(999);
      expect(result).toBeNull();
    });
  });

  describe("getByIdWithAuthor", () => {
    it("delegates to the repository returning the post with author", async () => {
      getPostByIdWithAuthorMock.mockResolvedValue(ownPostWithAuthor);
      const result = await getByIdWithAuthor(1);
      expect(result).toEqual(ownPostWithAuthor);
      expect(getPostByIdWithAuthorMock).toHaveBeenCalledWith(1);
    });

    it("returns null when the post does not exist", async () => {
      getPostByIdWithAuthorMock.mockResolvedValue(null);
      const result = await getByIdWithAuthor(999);
      expect(result).toBeNull();
    });
  });
});
