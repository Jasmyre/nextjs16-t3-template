import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeletePostDialog } from "@/components/delete-post-dialog";

const confirmationRegex = /Are you sure you want to delete "First post"\?/;

describe("DeletePostDialog", () => {
  const onConfirmMock = vi.fn();

  beforeEach(() => {
    onConfirmMock.mockReset();
    onConfirmMock.mockResolvedValue(undefined);
  });

  it("renders the post title in the confirmation", () => {
    render(
      <DeletePostDialog
        onConfirm={onConfirmMock}
        onOpenChange={vi.fn()}
        open={true}
        title="First post"
      />
    );

    expect(screen.getByText("Delete post")).toBeInTheDocument();
    expect(screen.getByText(confirmationRegex)).toBeInTheDocument();
  });

  it("calls onConfirm with the Delete button", async () => {
    const user = userEvent.setup();

    render(
      <DeletePostDialog
        onConfirm={onConfirmMock}
        onOpenChange={vi.fn()}
        open={true}
        title="First post"
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it("dismisses with the Cancel button without confirming", async () => {
    const onOpenChangeMock = vi.fn();
    const user = userEvent.setup();

    render(
      <DeletePostDialog
        onConfirm={onConfirmMock}
        onOpenChange={onOpenChangeMock}
        open={true}
        title="First post"
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    expect(onConfirmMock).not.toHaveBeenCalled();
  });
});
