import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignUpForm } from "@/components/sign-up-form";

const { signUpMock } = vi.hoisted(() => ({ signUpMock: vi.fn() }));

vi.mock("@/actions/sign-up", () => ({
  signUp: signUpMock,
}));

const nameInput = (): HTMLElement =>
  screen.getByPlaceholderText("Johnny Bravo");
const emailInput = (): HTMLElement =>
  screen.getByPlaceholderText("johndoe@example.com");
const passwordInput = (): HTMLElement => screen.getByPlaceholderText("******");

describe("SignUpForm", () => {
  beforeEach(() => {
    signUpMock.mockReset();
    signUpMock.mockResolvedValue({ success: "User created!" });
  });

  it("renders name, email, password and a sign-up button", () => {
    render(<SignUpForm />);
    expect(screen.getByPlaceholderText("Johnny Bravo")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("johndoe@example.com")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("******")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("submits the entered values to the sign-up action", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(nameInput(), "Johnny Bravo");
    await user.type(emailInput(), "johnny@example.com");
    await user.type(passwordInput(), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        name: "Johnny Bravo",
        email: "johnny@example.com",
        password: "secret123",
      });
    });
  });

  it("shows the error message returned by the sign-up action", async () => {
    signUpMock.mockResolvedValue({ error: "User already exists!" });
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(nameInput(), "Johnny Bravo");
    await user.type(emailInput(), "johnny@example.com");
    await user.type(passwordInput(), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByText("User already exists!")).toBeInTheDocument();
  });

  it("shows the success message returned by the sign-up action", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(nameInput(), "Johnny Bravo");
    await user.type(emailInput(), "johnny@example.com");
    await user.type(passwordInput(), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByText("User created!")).toBeInTheDocument();
  });
});
