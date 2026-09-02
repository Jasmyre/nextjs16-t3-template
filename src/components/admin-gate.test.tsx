import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminGate } from "@/components/admin-gate";

const mocks = vi.hoisted(() => ({
  authMock: vi.fn(),
  connectionMock: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.authMock }));
vi.mock("next/server", () => ({ connection: mocks.connectionMock }));

const { forbiddenMock } = vi.hoisted(() => ({ forbiddenMock: vi.fn() }));

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return { ...actual, forbidden: forbiddenMock };
});

describe("AdminGate", () => {
  beforeEach(() => {
    mocks.connectionMock.mockReset();
    mocks.authMock.mockReset();
    forbiddenMock.mockReset();
    forbiddenMock.mockImplementation(() => {
      throw new Error("forbidden");
    });
    mocks.connectionMock.mockResolvedValue(undefined);
  });

  it("renders children for an ADMIN session", async () => {
    mocks.authMock.mockResolvedValue({ user: { roles: ["ADMIN"] } });

    const element = await AdminGate({ children: <p>Admin content</p> });

    render(element);

    expect(screen.getByText("Admin content")).toBeInTheDocument();
    expect(forbiddenMock).not.toHaveBeenCalled();
  });

  it("forbids access for a non-admin role", async () => {
    mocks.authMock.mockResolvedValue({ user: { roles: ["USER"] } });

    await expect(
      AdminGate({ children: <p>Admin content</p> })
    ).rejects.toThrow();
    expect(forbiddenMock).toHaveBeenCalled();
  });

  it("forbids access when signed out", async () => {
    mocks.authMock.mockResolvedValue(null);

    await expect(
      AdminGate({ children: <p>Admin content</p> })
    ).rejects.toThrow();
    expect(forbiddenMock).toHaveBeenCalled();
  });
});
