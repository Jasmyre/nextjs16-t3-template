import { expect, test } from "@playwright/test";

const uniqueTitle = (prefix: string): string => `${prefix}-${Date.now()}`;

const EDIT_URL = /\/posts\/\d+\/edit/;

test.describe("post create", () => {
  test("authenticated user creates a post and sees it in the list", async ({
    page,
  }) => {
    const title = uniqueTitle("E2E Create");

    await page.goto("/posts/new");
    await page.getByPlaceholder("Post title").fill(title);
    await page.getByRole("button", { name: "Create Post" }).click();

    await expect(page).toHaveURL("/posts");
    await expect(
      page.getByRole("cell", { name: title, exact: true })
    ).toBeVisible();
  });
});

test.describe("post edit", () => {
  test("authenticated user edits a post and sees the updated title", async ({
    page,
  }) => {
    const originalTitle = uniqueTitle("E2E Edit Original");
    const updatedTitle = uniqueTitle("E2E Edit Updated");

    await page.goto("/posts/new");
    await page.getByPlaceholder("Post title").fill(originalTitle);
    await page.getByRole("button", { name: "Create Post" }).click();
    await expect(page).toHaveURL("/posts");

    const row = page.getByRole("row").filter({
      has: page.getByRole("cell", { name: originalTitle, exact: true }),
    });
    await row.getByRole("link", { name: `Edit ${originalTitle}` }).click();

    await expect(page).toHaveURL(EDIT_URL);
    const titleInput = page.getByRole("textbox", { name: "Title" }).last();
    await expect(titleInput).toHaveValue(originalTitle);
    await titleInput.fill(updatedTitle);
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page).toHaveURL("/posts");
    await expect(
      page.getByRole("cell", { name: updatedTitle, exact: true })
    ).toBeVisible();
  });
});

test.describe("post delete", () => {
  test("authenticated user deletes a post via the confirmation dialog", async ({
    page,
  }) => {
    const title = uniqueTitle("E2E Delete");

    await page.goto("/posts/new");
    await page.getByPlaceholder("Post title").fill(title);
    await page.getByRole("button", { name: "Create Post" }).click();
    await expect(page).toHaveURL("/posts");
    await expect(
      page.getByRole("cell", { name: title, exact: true })
    ).toBeVisible();

    await page.getByRole("button", { name: `Delete ${title}` }).click();
    await expect(
      page.getByText(`Are you sure you want to delete "${title}"?`)
    ).toBeVisible();

    await page.getByRole("button", { name: "Delete" }).last().click();
    await expect(
      page.getByRole("cell", { name: title, exact: true })
    ).not.toBeVisible();
  });
});
