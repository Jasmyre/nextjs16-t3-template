import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModeToggle } from "@/components/mode-toggle";

const { themeMock, setThemeMock } = vi.hoisted(() => ({
  themeMock: { value: "light" },
  setThemeMock: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: themeMock.value,
    setTheme: setThemeMock,
    themes: ["light", "dark"],
    systemTheme: "light",
    resolvedTheme: themeMock.value,
  }),
}));

describe("ModeToggle", () => {
  beforeEach(() => {
    themeMock.value = "light";
    setThemeMock.mockReset();
  });

  it("renders a toggle button with the expected aria-label", () => {
    render(<ModeToggle />);
    const button = screen.getByRole("button", { name: "Toggle theme" });
    expect(button).toBeInTheDocument();
  });

  it("calls setTheme with 'dark' when the current theme is light", () => {
    render(<ModeToggle />);
    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);
    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme with 'light' when the current theme is dark", () => {
    themeMock.value = "dark";
    render(<ModeToggle />);
    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);
    expect(setThemeMock).toHaveBeenCalledWith("light");
  });
});
