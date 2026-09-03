import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostCreateForm } from "@/components/post-create-form";

interface MutationConfig {
  onError?: (error: { message?: string }) => void;
  onSuccess?: () => Promise<void> | void;
}

const mocks = vi.hoisted(() => ({
  pushMock: vi.fn(),
  invalidatePostListMock: vi.fn(),
  invalidateDashboardMock: vi.fn(),
  mutateMock: vi.fn(),
  mutationConfigs: [] as MutationConfig[],
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    ...props
  }: {
    href: string;
    children?: React.ReactNode;
  }) => (
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

vi.mock("@/trpc/react", () => ({
  api: {
    post: {
      create: {
        useMutation: (config: MutationConfig) => {
          mocks.mutationConfigs.push(config);
          return { mutate: mocks.mutateMock, isPending: false };
        },
      },
    },
    useUtils: () => ({
      post: { list: { invalidate: mocks.invalidatePostListMock } },
      dashboard: { getStats: { invalidate: mocks.invalidateDashboardMock } },
    }),
  },
}));

const titleInput = (): HTMLElement => screen.getByPlaceholderText("Post title");

describe("PostCreateForm", () => {
  beforeEach(() => {
    mocks.pushMock.mockReset();
    mocks.mutateMock.mockReset();
    mocks.invalidatePostListMock.mockReset();
    mocks.invalidateDashboardMock.mockReset();
    mocks.mutationConfigs.length = 0;
  });

  it("renders a title field, submit button, and back link", () => {
    render(<PostCreateForm />);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Post" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Posts" })).toHaveAttribute(
      "href",
      "/posts"
    );
  });

  it("submits the entered title to the create mutation", async () => {
    const user = userEvent.setup();
    render(<PostCreateForm />);

    await user.type(titleInput(), "My new post");
    await user.click(screen.getByRole("button", { name: "Create Post" }));

    expect(mocks.mutateMock).toHaveBeenCalledWith({ name: "My new post" });
  });

  it("shows an inline error for an empty title", async () => {
    const user = userEvent.setup();
    render(<PostCreateForm />);

    await user.click(screen.getByRole("button", { name: "Create Post" }));

    expect(mocks.mutateMock).not.toHaveBeenCalled();
    expect(
      await screen.findByText("String must contain at least 1 character(s)")
    ).toBeInTheDocument();
  });

  it("invalidates lists and navigates to /posts on success", async () => {
    render(<PostCreateForm />);

    const config = mocks.mutationConfigs[0];
    if (!config?.onSuccess) {
      throw new Error("expected onSuccess to be set");
    }
    await config.onSuccess();

    expect(mocks.invalidatePostListMock).toHaveBeenCalled();
    expect(mocks.invalidateDashboardMock).toHaveBeenCalled();
    expect(mocks.pushMock).toHaveBeenCalledWith("/posts");
  });

  it("shows the mutation error message", async () => {
    render(<PostCreateForm />);

    const config = mocks.mutationConfigs[0];
    if (!config?.onError) {
      throw new Error("expected onError to be set");
    }
    config.onError({ message: "Failed to create post." });

    expect(
      await screen.findByText("Failed to create post.")
    ).toBeInTheDocument();
  });
});
