import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ManageRolesDialog } from "@/components/manage-roles-dialog";

const mockUser = {
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date("2026-01-15"),
  roles: [{ id: 1, name: "USER" as const }],
};

const aliceDescription = "Toggle roles for Alice.";

describe("ManageRolesDialog", () => {
  const onSaveMock = vi.fn();

  beforeEach(() => {
    onSaveMock.mockReset();
    onSaveMock.mockResolvedValue(undefined);
  });

  it("renders the user name and current roles", () => {
    render(
      <ManageRolesDialog
        onOpenChange={vi.fn()}
        onSave={onSaveMock}
        open={true}
        user={mockUser}
      />
    );

    expect(screen.getByText("Manage roles")).toBeInTheDocument();
    expect(screen.getByText(aliceDescription)).toBeInTheDocument();
    expect(screen.getByText("USER")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("MODERATOR")).toBeInTheDocument();
  });

  it("calls onSave with updated roles when save is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ManageRolesDialog
        onOpenChange={vi.fn()}
        onSave={onSaveMock}
        open={true}
        user={mockUser}
      />
    );

    await user.click(screen.getByRole("button", { name: "Toggle ADMIN" }));

    const saveButton = screen.getByRole("button", { name: "Save" });
    await user.click(saveButton);

    expect(onSaveMock).toHaveBeenCalledWith("user-1", ["USER", "ADMIN"]);
  });

  it("calls onOpenChange(false) on cancel", async () => {
    const onOpenChangeMock = vi.fn();
    const user = userEvent.setup();

    render(
      <ManageRolesDialog
        onOpenChange={onOpenChangeMock}
        onSave={onSaveMock}
        open={true}
        user={mockUser}
      />
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    expect(onSaveMock).not.toHaveBeenCalled();
  });

  it("deselects a role that was initially assigned", async () => {
    const user = userEvent.setup();

    render(
      <ManageRolesDialog
        onOpenChange={vi.fn()}
        onSave={onSaveMock}
        open={true}
        user={mockUser}
      />
    );

    await user.click(screen.getByRole("button", { name: "Toggle USER" }));

    const saveButton = screen.getByRole("button", { name: "Save" });
    await user.click(saveButton);

    expect(onSaveMock).toHaveBeenCalledWith("user-1", []);
  });
});
