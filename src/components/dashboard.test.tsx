import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Dashboard } from "@/components/dashboard";

vi.mock("next/link", () => ({
  default: ({
    href,
    ...props
  }: {
    href: string;
    children?: ReactNode;
    "aria-label"?: string;
  }) => (
    <a href={href} {...props}>
      {props.children}
    </a>
  ),
}));

const mocks = vi.hoisted(() => ({
  statsMock: vi.fn(),
  postsMock: vi.fn(),
}));

vi.mock("@/trpc/react", () => ({
  api: {
    dashboard: {
      getStats: {
        useSuspenseQuery: () => [mocks.statsMock()],
      },
    },
    post: {
      list: {
        useSuspenseQuery: () => [mocks.postsMock()],
      },
    },
  },
}));

const mockStats = {
  myPosts: 2,
  totalPosts: 5,
  totalUsers: 10,
};

const mockPost = {
  id: 1,
  name: "First post",
  authorId: "user-1",
  createdAt: new Date("2026-01-15"),
  updatedAt: new Date("2026-01-15"),
  author: { name: "Alice" },
};

describe("Dashboard", () => {
  beforeEach(() => {
    mocks.statsMock.mockReset();
    mocks.postsMock.mockReset();
  });

  it("renders the stat cards from dashboard stats", () => {
    mocks.statsMock.mockReturnValue(mockStats);
    mocks.postsMock.mockReturnValue([]);

    render(<Dashboard />);

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Total Posts")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("My Posts")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders recent posts with title, created date, and edit link", () => {
    mocks.statsMock.mockReturnValue(mockStats);
    mocks.postsMock.mockReturnValue([mockPost]);

    render(<Dashboard />);

    expect(screen.getByText("Recent Posts")).toBeInTheDocument();
    expect(screen.getByText("First post")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/posts/1/edit"
    );
  });

  it("links the New Post button to /posts/new", () => {
    mocks.statsMock.mockReturnValue(mockStats);
    mocks.postsMock.mockReturnValue([]);

    render(<Dashboard />);

    expect(screen.getByRole("link", { name: "New Post" })).toHaveAttribute(
      "href",
      "/posts/new"
    );
  });
});
