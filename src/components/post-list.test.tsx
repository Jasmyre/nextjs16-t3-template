import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostList } from "@/components/post-list";

interface MutationConfig {
  onSuccess?: () => Promise<void> | void;
}

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
  postsMock: vi.fn(),
  invalidatePostListMock: vi.fn(),
  invalidateDashboardMock: vi.fn(),
  mutateAsyncMock: vi.fn(),
  mutationConfigs: [] as MutationConfig[],
}));

vi.mock("@/trpc/react", () => ({
  api: {
    post: {
      list: {
        useSuspenseQuery: () => [mocks.postsMock()],
      },
      delete: {
        useMutation: (config: MutationConfig) => {
          mocks.mutationConfigs.push(config);
          return { mutateAsync: mocks.mutateAsyncMock, isPending: false };
        },
      },
    },
    useUtils: () => ({
      post: { list: { invalidate: mocks.invalidatePostListMock } },
      dashboard: { getStats: { invalidate: mocks.invalidateDashboardMock } },
    }),
  },
}));

const mockPost = {
  id: 1,
  name: "First post",
  authorId: "user-1",
  createdAt: new Date("2026-01-15"),
  updatedAt: new Date("2026-01-15"),
  author: { name: "Alice" },
};

const mockPost2 = {
  id: 2,
  name: "Second post",
  authorId: "user-2",
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
  author: { name: "Bob" },
};

describe("PostList", () => {
  beforeEach(() => {
    mocks.postsMock.mockReset();
    mocks.mutateAsyncMock.mockReset();
    mocks.invalidatePostListMock.mockReset();
    mocks.invalidateDashboardMock.mockReset();
    mocks.mutationConfigs.length = 0;
    mocks.mutateAsyncMock.mockResolvedValue(undefined);
  });

  it("renders posts with title, author, and created date", () => {
    mocks.postsMock.mockReturnValue([mockPost, mockPost2]);

    render(<PostList />);

    expect(screen.getByText("First post")).toBeInTheDocument();
    expect(screen.getByText("Second post")).toBeInTheDocument();
    expect(screen.getAllByText("Alice")).toHaveLength(1);
    expect(screen.getAllByText("Bob")).toHaveLength(1);
  });

  it("links to the new post page from the New Post button", () => {
    mocks.postsMock.mockReturnValue([]);

    render(<PostList />);

    expect(screen.getByRole("link", { name: "New Post" })).toHaveAttribute(
      "href",
      "/posts/new"
    );
  });

  it("links each row to its edit page", () => {
    mocks.postsMock.mockReturnValue([mockPost]);

    render(<PostList />);

    expect(
      screen.getByRole("link", { name: "Edit First post" })
    ).toHaveAttribute("href", "/posts/1/edit");
  });

  it("opens the delete confirmation dialog and deletes on confirm", async () => {
    mocks.postsMock.mockReturnValue([mockPost]);
    const user = userEvent.setup();

    render(<PostList />);

    await user.click(screen.getByRole("button", { name: "Delete First post" }));

    expect(screen.getByText("Delete post")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(mocks.mutateAsyncMock).toHaveBeenCalledWith({ id: 1 });

    const config = mocks.mutationConfigs[0];
    if (!config?.onSuccess) {
      throw new Error("expected onSuccess to be set");
    }
    await config.onSuccess();

    expect(mocks.invalidatePostListMock).toHaveBeenCalled();
    expect(mocks.invalidateDashboardMock).toHaveBeenCalled();
  });

  it("cancels the dialog without deleting", async () => {
    mocks.postsMock.mockReturnValue([mockPost]);
    const user = userEvent.setup();

    render(<PostList />);

    await user.click(screen.getByRole("button", { name: "Delete First post" }));

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(mocks.mutateAsyncMock).not.toHaveBeenCalled();
    expect(screen.queryByText("Delete post")).not.toBeInTheDocument();
  });
});
