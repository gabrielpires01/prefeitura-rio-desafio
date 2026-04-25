import { test, expect } from "@playwright/test";

const TEST_CHILD_ID = "c018";

test.describe("Child detail", () => {
  test("shows the child header with name, age and bairro", async ({ page }) => {
    await page.goto(`/children/${TEST_CHILD_ID}`);

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("Jacarezinho")).toBeVisible();
  });

  test("shows health, education and social assistance area cards", async ({ page }) => {
    await page.goto(`/children/${TEST_CHILD_ID}`);

    await expect(page.getByText("Saúde")).toBeVisible();
    await expect(page.getByText("Educação")).toBeVisible();
    await expect(page.getByText(/Assist/)).toBeVisible();
  });

  test("shows 'Marcar como revisado' button for a non-reviewed child", async ({ page }) => {
    await page.goto(`/children/${TEST_CHILD_ID}`);

    await expect(
      page.getByRole("button", { name: /Marcar como revisado/ })
    ).toBeVisible();
  });

  test("marking as reviewed replaces button with 'Revisado' badge", async ({ page }) => {
    await page.goto(`/children/${TEST_CHILD_ID}`);

    await page.getByRole("button", { name: /Marcar como revisado/ }).click();

    await expect(page.getByText("Revisado")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Marcar como revisado/ })
    ).not.toBeVisible();
  });

  test("'Voltar' button navigates back to the children list", async ({ page }) => {
    await page.goto("/children");
    await page.locator("a[href^='/children/']").first().click();
    await page.waitForURL(/\/children\/.+/);

    await page.getByRole("button", { name: "Voltar" }).click();

    await expect(page).toHaveURL("/children");
  });
});
