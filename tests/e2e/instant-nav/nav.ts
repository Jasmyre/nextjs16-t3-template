import { expect, type Page } from "@playwright/test";

// Ensure a sidebar nav link is visible before the instant() lock is acquired.
// Waits for the (possibly streamed, session-aware) item first; only when it
// stays hidden — the mobile drawer below the md breakpoint — opens the drawer
// via the header SidebarTrigger. Call this BEFORE instant(); click inside.
export async function ensureSidebarLinkVisible(
  page: Page,
  name: string
): Promise<void> {
  const trigger = page.getByRole("link", { name, exact: true });
  try {
    await expect(trigger).toBeVisible({ timeout: 20_000 });
  } catch {
    await page.getByRole("button", { name: "Toggle Sidebar" }).first().click();
    await expect(trigger).toBeVisible({ timeout: 20_000 });
  }
}
