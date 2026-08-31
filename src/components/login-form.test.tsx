import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LogInForm } from "@/components/login-form";

const { loginMock } = vi.hoisted(() => ({ loginMock: vi.fn() }));

vi.mock("@/actions/login", () => ({
  login: loginMock,
}));

const emailInput = (): HTMLElement =>
  screen.getByPlaceholderText("johndoe@example.com");
const passwordInput = (): HTMLElement => screen.getByPlaceholderText("******");

describe("LogInForm", () => {
  beforeEach(() => {
    loginMock.mockReset();
    loginMock.mockResolvedValue({ success: "Email sent!" });
  });

  it("renders email, password and a sign-in button", () => {
    render(<LogInForm />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("******")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("submits the entered credentials to the login action", async () => {
    const user = userEvent.setup();
    render(<LogInForm />);

    await user.type(emailInput(), "jane@example.com");
    await user.type(passwordInput(), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "jane@example.com",
        password: "secret123",
      });
    });
  });

  it("shows the error message returned by the login action", async () => {
    loginMock.mockResolvedValue({ error: "Invalid credentials!" });
    const user = userEvent.setup();
    render(<LogInForm />);

    await user.type(emailInput(), "jane@example.com");
    await user.type(passwordInput(), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Invalid credentials!")).toBeInTheDocument();
  });

  it("shows the success message returned by the login action", async () => {
    const user = userEvent.setup();
    render(<LogInForm />);

    await user.type(emailInput(), "jane@example.com");
    await user.type(passwordInput(), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Email sent!")).toBeInTheDocument();
  });
});
