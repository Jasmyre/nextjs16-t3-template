import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OfflinePage from "@/app/offline/page";

describe("OfflinePage", () => {
  it("explains the offline state with recovery links", () => {
    render(<OfflinePage />);

    expect(
      screen.getByRole("heading", { name: "You're offline" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(
      screen.getByRole("link", { name: "Back to landing" })
    ).toHaveAttribute("href", "/landing");
  });
});
