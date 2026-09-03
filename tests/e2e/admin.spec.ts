import { expect, test } from "@playwright/test";

test.describe("admin role assignment", () => {
  test("admin changes a user's roles via the dialog and it persists", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: "User management" })
    ).toBeVisible();

    const row = page
      .getByRole("row")
      .filter({ has: page.getByRole("cell", { name: "E2E Role Target" }) })
      .first();
    await expect(row).toBeVisible();

    await row
      .getByRole("button", { name: "Manage roles for E2E Role Target" })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "Manage roles" })
    ).toBeVisible();

    const moderatorToggle = dialog.getByRole("button", {
      name: "Toggle MODERATOR",
    });
    const hadModerator =
      (await moderatorToggle.getAttribute("aria-pressed")) === "true";
    await moderatorToggle.click();
    await dialog.getByRole("button", { name: "Save" }).click();
    await expect(dialog).not.toBeVisible();

    const updatedRow = page
      .getByRole("row")
      .filter({ has: page.getByRole("cell", { name: "E2E Role Target" }) })
      .first();
    const moderatorBadge = updatedRow
      .getByRole("cell")
      .nth(2)
      .getByText("MODERATOR");

    if (hadModerator) {
      await expect(moderatorBadge).not.toBeVisible();
    } else {
      await expect(moderatorBadge).toBeVisible();
    }
  });
});
