import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignOutButton } from "@/components/sign-out-button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const { signOutMock } = vi.hoisted(() => ({ signOutMock: vi.fn() }));

vi.mock("next-auth/react", () => ({
  signOut: signOutMock,
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    signOutMock.mockReset();
    signOutMock.mockResolvedValue(undefined);
  });

  it("renders a log out button", () => {
    render(<SignOutButton />);

    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });

  it("signs the user out and redirects to the default login redirect", async () => {
    const user = userEvent.setup();
    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(signOutMock).toHaveBeenCalledWith({
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  });
});
