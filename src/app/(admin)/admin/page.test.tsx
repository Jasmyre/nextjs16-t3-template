import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/(admin)/admin/page";

vi.mock("@/trpc/server", () => ({
  api: { admin: { listUsers: { prefetch: vi.fn() } } },
  HydrateClient: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/user-table", () => ({
  UserTable: () => <div data-testid="user-table">users</div>,
}));

describe("AdminPage", () => {
  it("constrains the page width so overlays cannot shift it", async () => {
    render(await AdminPage());

    expect(screen.getByTestId("user-table")).toBeInTheDocument();
    expect(screen.getByRole("main").className).toContain("min-w-0");
  });
});
