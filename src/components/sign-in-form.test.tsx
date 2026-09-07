import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignInForm } from "@/components/sign-in-form";

const { signInMock } = vi.hoisted(() => ({ signInMock: vi.fn() }));

vi.mock("@/actions/sign-in", () => ({
  signIn: signInMock,
}));

const emailInput = (): HTMLElement =>
  screen.getByPlaceholderText("johndoe@example.com");
const passwordInput = (): HTMLElement => screen.getByPlaceholderText("******");

describe("SignInForm", () => {
  beforeEach(() => {
    signInMock.mockReset();
    signInMock.mockResolvedValue({ success: "Email sent!" });
  });

  it("renders email, password and a sign-in button", () => {
    render(<SignInForm />);
    expect(
      screen.getByPlaceholderText("johndoe@example.com")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("******")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("submits the entered credentials to the sign-in action", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(emailInput(), "jane@example.com");
    await user.type(passwordInput(), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith({
        email: "jane@example.com",
        password: "secret123",
      });
    });
  });

  it("shows the error message returned by the sign-in action", async () => {
    signInMock.mockResolvedValue({ error: "Invalid credentials!" });
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(emailInput(), "jane@example.com");
    await user.type(passwordInput(), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Invalid credentials!")).toBeInTheDocument();
  });

  it("shows the success message returned by the sign-in action", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(emailInput(), "jane@example.com");
    await user.type(passwordInput(), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Email sent!")).toBeInTheDocument();
  });
});
