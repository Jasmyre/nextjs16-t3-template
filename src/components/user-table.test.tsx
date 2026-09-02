import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserTable } from "@/components/user-table";

interface MutationConfig {
  onSuccess?: () => Promise<void> | void;
}

const mocks = vi.hoisted(() => ({
  usersMock: vi.fn(),
  invalidateMock: vi.fn(),
  mutateAsyncMock: vi.fn(),
  mutationConfigs: [] as MutationConfig[],
}));

vi.mock("@/trpc/react", () => ({
  api: {
    admin: {
      listUsers: {
        useSuspenseQuery: () => [mocks.usersMock()],
      },
      updateRoles: {
        useMutation: (config: MutationConfig) => {
          mocks.mutationConfigs.push(config);
          return { mutateAsync: mocks.mutateAsyncMock, isPending: false };
        },
      },
    },
    useUtils: () => ({
      admin: { listUsers: { invalidate: mocks.invalidateMock } },
    }),
  },
}));

const mockUser = {
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date("2026-01-15"),
  roles: [{ id: 1, name: "USER" as const }],
};

const mockAdminUser = {
  id: "user-2",
  name: "Bob",
  email: "bob@example.com",
  createdAt: new Date("2026-06-01"),
  roles: [
    { id: 1, name: "ADMIN" as const },
    { id: 2, name: "MODERATOR" as const },
  ],
};

describe("UserTable", () => {
  beforeEach(() => {
    mocks.usersMock.mockReset();
    mocks.mutateAsyncMock.mockReset();
    mocks.invalidateMock.mockReset();
    mocks.mutationConfigs.length = 0;
    mocks.mutateAsyncMock.mockResolvedValue(undefined);
  });

  it("renders all users with name, email, roles, and joined date", () => {
    mocks.usersMock.mockReturnValue([mockUser, mockAdminUser]);

    render(<UserTable />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    expect(screen.getByText("USER")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("MODERATOR")).toBeInTheDocument();
  });

  it("opens the manage roles dialog when the action button is clicked", async () => {
    mocks.usersMock.mockReturnValue([mockUser]);
    const user = userEvent.setup();

    render(<UserTable />);

    await user.click(
      screen.getByRole("button", { name: "Manage roles for Alice" })
    );

    expect(screen.getByText("Manage roles")).toBeInTheDocument();
    expect(screen.getByText("Toggle roles for Alice.")).toBeInTheDocument();
  });

  it("calls updateRoles mutation and invalidates the cache on save", async () => {
    mocks.usersMock.mockReturnValue([mockUser]);
    const user = userEvent.setup();

    render(<UserTable />);

    await user.click(
      screen.getByRole("button", { name: "Manage roles for Alice" })
    );

    const saveButton = screen.getByRole("button", { name: "Save" });
    await user.click(saveButton);

    expect(mocks.mutateAsyncMock).toHaveBeenCalledWith({
      userId: "user-1",
      roleNames: ["USER"],
    });

    const config = mocks.mutationConfigs[0];
    if (!config?.onSuccess) {
      throw new Error("expected onSuccess to be set");
    }
    await config.onSuccess();

    expect(mocks.invalidateMock).toHaveBeenCalled();
  });

  it("dismisses the dialog on cancel without calling mutation", async () => {
    mocks.usersMock.mockReturnValue([mockUser]);
    const user = userEvent.setup();

    render(<UserTable />);

    await user.click(
      screen.getByRole("button", { name: "Manage roles for Alice" })
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(mocks.mutateAsyncMock).not.toHaveBeenCalled();
    expect(screen.queryByText("Manage roles")).not.toBeInTheDocument();
  });
});
