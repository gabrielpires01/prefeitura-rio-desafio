import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows Dashboard heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("shows summary stat cards", async ({ page }) => {
    await expect(page.getByText("Total de Crianças")).toBeVisible();
    await expect(page.getByText("Alertas de Saúde")).toBeVisible();
    await expect(page.getByText("Alertas de Educação")).toBeVisible();
    await expect(page.getByText("Revisadas")).toBeVisible();
  });

  test("stat cards display numeric values from the API", async ({ page }) => {
    const totalCard = page.getByText("Total de Crianças").locator("..");
    await expect(totalCard.getByText("25")).toBeVisible();
  });

  test("renders alerts bar chart", async ({ page }) => {
    await expect(page.locator("svg").first()).toBeVisible();
  });

  test("navigating to /children works via URL", async ({ page }) => {
    await page.goto("/children");
    await expect(page.getByRole("heading", { name: "Crianças" })).toBeVisible();
  });
});
