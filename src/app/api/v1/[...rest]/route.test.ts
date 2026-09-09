import type { RoleName } from "@prisma/client";
import type { Session } from "next-auth";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const {
  greetMock,
  createMock,
  getLatestMock,
  getByIdMock,
  updateMock,
  removeMock,
  listMock,
  getByIdWithAuthorMock,
  getStatsMock,
  createRestContextMock,
} = vi.hoisted(() => ({
  greetMock: vi.fn(),
  createMock: vi.fn(),
  getLatestMock: vi.fn(),
  getByIdMock: vi.fn(),
  updateMock: vi.fn(),
  removeMock: vi.fn(),
  listMock: vi.fn(),
  getByIdWithAuthorMock: vi.fn(),
  getStatsMock: vi.fn(),
  createRestContextMock: vi.fn(),
}));

vi.mock("@/services/post-service", () => ({
  greet: greetMock,
  create: createMock,
  getLatest: getLatestMock,
  getById: getByIdMock,
  update: updateMock,
  remove: removeMock,
  list: listMock,
  getByIdWithAuthor: getByIdWithAuthorMock,
}));

vi.mock("@/services/dashboard-service", () => ({
  getStats: getStatsMock,
}));

vi.mock("@/server/api/rest-auth", () => ({
  createRestContext: createRestContextMock,
}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/redis", () => ({
  redis: {},
}));

import {
  DELETE as deleteHandler,
  GET as getHandler,
  PATCH as patchHandler,
  POST as postHandler,
} from "@/app/api/v1/[...rest]/route";

const makeUser = (id: string, roles: RoleName[]): Session["user"] =>
  ({
    id,
    roles,
    userName: `user-${id}`,
    emailVerified: new Date(),
  }) as Session["user"];

const stamp = new Date("2026-01-15T00:00:00.000Z");
const isoStamp = stamp.toISOString();

const ownPost = {
  id: 1,
  name: "My post",
  authorId: "user-1",
  createdAt: stamp,
  updatedAt: stamp,
};
const otherPost = {
  id: 2,
  name: "Their post",
  authorId: "user-2",
  createdAt: stamp,
  updatedAt: stamp,
};
const ownPostWithAuthor = { ...ownPost, author: { name: "My name" } };
const otherPostWithAuthor = { ...otherPost, author: { name: "Their name" } };

const request = (
  path: string,
  init?: { method?: string; body?: unknown; headers?: Headers }
): Request => {
  const headers = init?.headers ?? new Headers();
  if (init?.body !== undefined && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  return new Request(`http://localhost:3000${path}`, {
    method: init?.method ?? "GET",
    headers,
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });
};

const stubContext = (user: Session["user"] | null): void => {
  createRestContextMock.mockResolvedValue({
    headers: new Headers(),
    user,
  });
};

/**
 * HTTP seam for the versioned REST mount: real fetch handler, stubbed
 * context and services. Pins status mapping, plain-JSON ISO wire shape,
 * visibility threading, and admin absence — never generator internals.
 */
describe("REST mount", () => {
  beforeAll(() => {
    vi.stubEnv("NODE_ENV", "production");
  });

  beforeEach(() => {
    for (const mock of [
      greetMock,
      createMock,
      getLatestMock,
      getByIdMock,
      updateMock,
      removeMock,
      listMock,
      getByIdWithAuthorMock,
      getStatsMock,
      createRestContextMock,
    ]) {
      mock.mockReset();
    }
  });

  it("serves public reads signed-out as plain JSON", async () => {
    stubContext(null);
    greetMock.mockReturnValue("Hello World");
    getLatestMock.mockResolvedValue(null);

    const greeting = await getHandler(request("/api/v1/greeting?text=World"));
    expect(greeting.status).toBe(200);
    expect(await greeting.json()).toEqual({ greeting: "Hello World" });

    const latest = await getHandler(request("/api/v1/posts/latest"));
    expect(latest.status).toBe(200);
    expect(await latest.json()).toBeNull();
  });

  it("rejects protected Operations signed-out with 401", async () => {
    stubContext(null);

    const res = await getHandler(request("/api/v1/posts"));
    expect(res.status).toBe(401);
    expect(listMock).not.toHaveBeenCalled();
  });

  it("rejects an ungranted caller with 403", async () => {
    stubContext(makeUser("user-9", []));

    const res = await getHandler(request("/api/v1/posts"));
    expect(res.status).toBe(403);
    expect(listMock).not.toHaveBeenCalled();
  });

  it("denies row-level ownership with 403 and never touches the service", async () => {
    stubContext(makeUser("user-1", ["USER"]));
    getByIdMock.mockResolvedValue(otherPost);

    const res = await patchHandler(
      request("/api/v1/posts/2", {
        method: "PATCH",
        body: { name: "Hijacked" },
      })
    );

    expect(res.status).toBe(403);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("maps a missing record to 404", async () => {
    stubContext(makeUser("user-1", ["USER"]));
    getByIdWithAuthorMock.mockResolvedValue(null);

    const res = await getHandler(request("/api/v1/posts/404"));

    expect(res.status).toBe(404);
  });

  it("threads USER-scoped visibility versus privileged-wide listing", async () => {
    stubContext(makeUser("user-1", ["USER"]));
    listMock.mockResolvedValue([ownPostWithAuthor]);

    const userRes = await getHandler(request("/api/v1/posts"));
    expect(userRes.status).toBe(200);
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1", roles: ["USER"] })
    );
    const userBody = (await userRes.json()) as unknown[];
    expect(userBody).toHaveLength(1);

    listMock.mockReset();
    stubContext(makeUser("user-3", ["ADMIN"]));
    listMock.mockResolvedValue([ownPostWithAuthor, otherPostWithAuthor]);

    const adminRes = await getHandler(request("/api/v1/posts"));
    expect(adminRes.status).toBe(200);
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-3", roles: ["ADMIN"] })
    );
    const adminBody = (await adminRes.json()) as unknown[];
    expect(adminBody).toHaveLength(2);
  });

  it("returns ISO datetimes as plain JSON without a superjson envelope", async () => {
    stubContext(makeUser("user-1", ["USER"]));
    createMock.mockResolvedValue(ownPost);

    const res = await postHandler(
      request("/api/v1/posts", { method: "POST", body: { name: "My post" } })
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.createdAt).toBe(isoStamp);
    expect(body.updatedAt).toBe(isoStamp);
    expect(body).not.toHaveProperty("json");
    expect(body).not.toHaveProperty("meta");
  });

  it("serves dashboard stats over the versioned path", async () => {
    stubContext(makeUser("user-1", ["USER"]));
    getStatsMock.mockResolvedValue({
      totalUsers: 3,
      totalPosts: 5,
      myPosts: 2,
    });

    const res = await getHandler(request("/api/v1/dashboard/stats"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      totalUsers: 3,
      totalPosts: 5,
      myPosts: 2,
    });
    expect(getStatsMock).toHaveBeenCalledWith("user-1");
  });

  it("leaves the admin surface unmounted (404)", async () => {
    stubContext(makeUser("user-3", ["ADMIN"]));

    const res = await getHandler(request("/api/v1/admin/listUsers"));

    expect(res.status).toBe(404);
  });

  it("deletes an owned post and returns plain JSON", async () => {
    stubContext(makeUser("user-1", ["USER"]));
    getByIdMock.mockResolvedValue(ownPost);
    removeMock.mockResolvedValue(ownPost);

    const res = await deleteHandler(
      request("/api/v1/posts/1", { method: "DELETE" })
    );

    expect(res.status).toBe(200);
    expect(removeMock).toHaveBeenCalledWith(1);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.createdAt).toBe(isoStamp);
  });
});
