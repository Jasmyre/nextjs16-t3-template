import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignupForm } from "@/components/sign-up-form";

const { registerMock } = vi.hoisted(() => ({ registerMock: vi.fn() }));

vi.mock("@/actions/register", () => ({
  register: registerMock,
}));

const nameInput = (): HTMLElement =>
  screen.getByPlaceholderText("Johnny Bravo");
const emailInput = (): HTMLElement =>
  screen.getByPlaceholderText("johndoe@example.com");
const passwordInput = (): HTMLElement => screen.getByPlaceholderText("******");

describe("SignupForm", () => {
  beforeEach(() => {
    registerMock.mockReset();
    registerMock.mockResolvedValue({ success: "User created!" });
  });

  it("renders name, email, password and a sign-up button", () => {
    render(<SignupForm />);
    expect(screen.getByPlaceholderText("Johnny Bravo")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("johndoe@example.com")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("******")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("submits the entered values to the register action", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(nameInput(), "Johnny Bravo");
    await user.type(emailInput(), "johnny@example.com");
    await user.type(passwordInput(), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        name: "Johnny Bravo",
        email: "johnny@example.com",
        password: "secret123",
      });
    });
  });

  it("shows the error message returned by the register action", async () => {
    registerMock.mockResolvedValue({ error: "User already exists!" });
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(nameInput(), "Johnny Bravo");
    await user.type(emailInput(), "johnny@example.com");
    await user.type(passwordInput(), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByText("User already exists!")).toBeInTheDocument();
  });

  it("shows the success message returned by the register action", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(nameInput(), "Johnny Bravo");
    await user.type(emailInput(), "johnny@example.com");
    await user.type(passwordInput(), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByText("User created!")).toBeInTheDocument();
  });
});
