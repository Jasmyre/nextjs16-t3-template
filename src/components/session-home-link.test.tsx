import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionHomeLink } from "@/components/session-home-link";

const mocks = vi.hoisted(() => ({
  authMock: vi.fn(),
  connectionMock: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.authMock }));
vi.mock("next/server", () => ({ connection: mocks.connectionMock }));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("SessionHomeLink", () => {
  beforeEach(() => {
    mocks.connectionMock.mockReset();
    mocks.authMock.mockReset();
    mocks.connectionMock.mockResolvedValue(undefined);
  });

  it("resolves the home link to the dashboard for an authenticated user", async () => {
    mocks.authMock.mockResolvedValue({ user: { roles: ["USER"] } });

    const element = await SessionHomeLink({ label: "Go Home" });

    render(element);

    expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("resolves the home link to the landing page for a signed-out visitor", async () => {
    mocks.authMock.mockResolvedValue(null);

    const element = await SessionHomeLink({ label: "Go Home" });

    render(element);

    expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute(
      "href",
      "/landing"
    );
  });
});
