import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import OfflinePage from "@/app/offline/page";
import { reloadPage } from "@/lib/reload-page";

vi.mock("@/lib/reload-page", () => ({
  reloadPage: vi.fn(),
}));

describe("OfflinePage", () => {
  it("explains the offline state with a working retry and a landing link", async () => {
    const user = userEvent.setup();
    render(<OfflinePage />);

    expect(
      screen.getByRole("heading", { name: "You're offline" })
    ).toBeInTheDocument();
    // The retry reloads the failed navigation (restoring the page when back
    // online) instead of linking to a signed-in page that would fail offline.
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reloadPage).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("link", { name: "Back to landing" })
    ).toHaveAttribute("href", "/landing");
  });
});
