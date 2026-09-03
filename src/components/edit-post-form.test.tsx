import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditPostForm } from "@/components/edit-post-form";

interface MutationConfig {
  onError?: (error: { message?: string }) => void;
  onSuccess?: () => Promise<void> | void;
}

vi.mock("next/link", () => ({
  default: ({ href, ...props }: { href: string; children?: ReactNode }) => (
    <a href={href} {...props}>
      {props.children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.pushMock }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

const mocks = vi.hoisted(() => ({
  pushMock: vi.fn(),
  invalidatePostListMock: vi.fn(),
  invalidatePostByIdMock: vi.fn(),
  invalidateDashboardMock: vi.fn(),
  mutateMock: vi.fn(),
  mutationConfigs: [] as MutationConfig[],
}));

vi.mock("@/trpc/react", () => ({
  api: {
    post: {
      update: {
        useMutation: (config: MutationConfig) => {
          mocks.mutationConfigs.push(config);
          return { mutate: mocks.mutateMock, isPending: false };
        },
      },
    },
    useUtils: () => ({
      post: {
        list: { invalidate: mocks.invalidatePostListMock },
        getById: { invalidate: mocks.invalidatePostByIdMock },
      },
      dashboard: { getStats: { invalidate: mocks.invalidateDashboardMock } },
    }),
  },
}));

const post = { id: 7, name: "Original title" };

const titleInput = (): HTMLElement => screen.getByPlaceholderText("Post title");

describe("EditPostForm", () => {
  beforeEach(() => {
    mocks.pushMock.mockReset();
    mocks.mutateMock.mockReset();
    mocks.invalidatePostListMock.mockReset();
    mocks.invalidatePostByIdMock.mockReset();
    mocks.invalidateDashboardMock.mockReset();
    mocks.mutationConfigs.length = 0;
  });

  it("pre-fills the current post title", () => {
    render(<EditPostForm post={post} />);

    expect(titleInput()).toHaveValue("Original title");
  });

  it("renders a title field, submit button, and back link", () => {
    render(<EditPostForm post={post} />);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save Changes" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Posts" })).toHaveAttribute(
      "href",
      "/posts"
    );
  });

  it("submits the changed title to the update mutation with the post id", async () => {
    const user = userEvent.setup();
    render(<EditPostForm post={post} />);

    await user.clear(titleInput());
    await user.type(titleInput(), "Updated title");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(mocks.mutateMock).toHaveBeenCalledWith({
      id: 7,
      name: "Updated title",
    });
  });

  it("shows an inline error for an empty title", async () => {
    const user = userEvent.setup();
    render(<EditPostForm post={post} />);

    await user.clear(titleInput());
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(mocks.mutateMock).not.toHaveBeenCalled();
    expect(
      await screen.findByText("String must contain at least 1 character(s)")
    ).toBeInTheDocument();
  });

  it("invalidates lists and navigates to /posts on success", async () => {
    render(<EditPostForm post={post} />);

    const config = mocks.mutationConfigs[0];
    if (!config?.onSuccess) {
      throw new Error("expected onSuccess to be set");
    }
    await config.onSuccess();

    expect(mocks.invalidatePostListMock).toHaveBeenCalled();
    expect(mocks.invalidatePostByIdMock).toHaveBeenCalled();
    expect(mocks.invalidateDashboardMock).toHaveBeenCalled();
    expect(mocks.pushMock).toHaveBeenCalledWith("/posts");
  });

  it("shows the mutation error message", async () => {
    render(<EditPostForm post={post} />);

    const config = mocks.mutationConfigs[0];
    if (!config?.onError) {
      throw new Error("expected onError to be set");
    }
    config.onError({ message: "Failed to update post." });

    expect(
      await screen.findByText("Failed to update post.")
    ).toBeInTheDocument();
  });
});
