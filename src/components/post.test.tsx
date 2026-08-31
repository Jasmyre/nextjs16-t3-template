import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LatestPost } from "@/components/post";

interface MutationConfig {
  onSuccess?: () => Promise<void> | void;
}

const mocks = vi.hoisted(() => ({
  getLatestMock: vi.fn(),
  mutateMock: vi.fn(),
  invalidateMock: vi.fn(),
  mutationConfigs: [] as MutationConfig[],
}));

vi.mock("@/trpc/react", () => ({
  api: {
    post: {
      getLatest: {
        useSuspenseQuery: () => [mocks.getLatestMock()],
      },
      create: {
        useMutation: (config: MutationConfig) => {
          mocks.mutationConfigs.push(config);
          return { mutate: mocks.mutateMock, isPending: false };
        },
      },
    },
    useUtils: () => ({ post: { invalidate: mocks.invalidateMock } }),
  },
}));

describe("LatestPost", () => {
  beforeEach(() => {
    mocks.getLatestMock.mockReset();
    mocks.mutateMock.mockReset();
    mocks.invalidateMock.mockReset();
    mocks.mutationConfigs.length = 0;
  });

  it("shows an empty state when there are no posts", () => {
    mocks.getLatestMock.mockReturnValue(null);
    render(<LatestPost />);
    expect(screen.getByText("You have no posts yet.")).toBeInTheDocument();
  });

  it("shows the most recent post name", () => {
    mocks.getLatestMock.mockReturnValue({ name: "Hello world" });
    render(<LatestPost />);
    expect(
      screen.getByText("Your most recent post: Hello world")
    ).toBeInTheDocument();
  });

  it("submits the entered title to the create mutation", async () => {
    mocks.getLatestMock.mockReturnValue(null);
    const user = userEvent.setup();
    render(<LatestPost />);

    await user.type(screen.getByPlaceholderText("Title"), "My post");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mocks.mutateMock).toHaveBeenCalledWith({ name: "My post" });
    });
  });

  it("invalidates the post query and clears the input on success", async () => {
    mocks.getLatestMock.mockReturnValue(null);
    const user = userEvent.setup();
    render(<LatestPost />);

    await user.type(screen.getByPlaceholderText("Title"), "My post");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    const config = mocks.mutationConfigs[0];
    if (!config) {
      throw new Error("expected useMutation to be called");
    }

    await config.onSuccess?.();

    expect(mocks.invalidateMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Title")).toHaveValue("");
    });
  });
});
