import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RetryButton } from "@/components/retry-button";
import { reloadPage } from "@/lib/reload-page";

vi.mock("@/lib/reload-page", () => ({
  reloadPage: vi.fn(),
}));

describe("RetryButton", () => {
  it("retries the failed navigation when clicked", async () => {
    const user = userEvent.setup();
    render(<RetryButton />);

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(reloadPage).toHaveBeenCalledTimes(1);
  });
});
