import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock } = vi.hoisted(() => ({
  dbMock: {
    post: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/server/db", () => ({ db: dbMock }));

import {
  getPostByIdWithAuthor,
  listAllPosts,
  listPostsByAuthor,
} from "@/data/post-repository";

const ownPost = { id: 1, name: "My post", authorId: "user-1" };
const otherPost = { id: 2, name: "Their post", authorId: "user-2" };
const ownPostWithAuthor = { ...ownPost, author: { name: "My name" } };
const otherPostWithAuthor = { ...otherPost, author: { name: "Their name" } };

const withAuthor = { author: { select: { name: true } } };

describe("post repository", () => {
  beforeEach(() => {
    dbMock.post.findUnique.mockReset();
    dbMock.post.findMany.mockReset();
  });

  describe("listAllPosts", () => {
    it("queries all posts with author info ordered by createdAt desc", async () => {
      dbMock.post.findMany.mockResolvedValue([
        ownPostWithAuthor,
        otherPostWithAuthor,
      ]);
      const result = await listAllPosts();
      expect(result).toEqual([ownPostWithAuthor, otherPostWithAuthor]);
      expect(dbMock.post.findMany).toHaveBeenCalledWith({
        include: withAuthor,
        orderBy: { createdAt: "desc" },
      });
    });

    it("returns an empty array when no posts exist", async () => {
      dbMock.post.findMany.mockResolvedValue([]);
      const result = await listAllPosts();
      expect(result).toEqual([]);
    });
  });

  describe("listPostsByAuthor", () => {
    it("queries posts filtered by authorId with author info", async () => {
      dbMock.post.findMany.mockResolvedValue([ownPostWithAuthor]);
      const result = await listPostsByAuthor("user-1");
      expect(result).toEqual([ownPostWithAuthor]);
      expect(dbMock.post.findMany).toHaveBeenCalledWith({
        where: { authorId: "user-1" },
        include: withAuthor,
        orderBy: { createdAt: "desc" },
      });
    });

    it("returns an empty array when the author has no posts", async () => {
      dbMock.post.findMany.mockResolvedValue([]);
      const result = await listPostsByAuthor("user-999");
      expect(result).toEqual([]);
    });
  });

  describe("getPostByIdWithAuthor", () => {
    it("queries a single post with author info by id", async () => {
      dbMock.post.findUnique.mockResolvedValue(ownPostWithAuthor);
      const result = await getPostByIdWithAuthor(1);
      expect(result).toEqual(ownPostWithAuthor);
      expect(dbMock.post.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: withAuthor,
      });
    });

    it("returns null when the post does not exist", async () => {
      dbMock.post.findUnique.mockResolvedValue(null);
      const result = await getPostByIdWithAuthor(999);
      expect(result).toBeNull();
    });
  });
});
