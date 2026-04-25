import { test, expect } from "@playwright/test";

test.describe("Children list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/children");
    await expect(page.getByText(/\d+ registro/)).toBeVisible();
  });

  test("shows the Crianças heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Crianças" })).toBeVisible();
  });

  test("renders child cards from the seed data", async ({ page }) => {
    const cards = page.locator("a[href^='/children/']");
    await expect(cards).toHaveCount(12);
  });

  test("filter by bairro limits the results", async ({ page }) => {
    await page.getByLabel("Filtrar por bairro").selectOption("Rocinha");

    await expect(page.getByText("5 registros")).toBeVisible();
    const cards = page.locator("a[href^='/children/']");
    await expect(cards).toHaveCount(5);
  });

  test("filter by 'Com alertas' shows only children with alerts", async ({ page }) => {
    await page.getByLabel("Filtrar por alertas").click();
    await expect(page.getByLabel("Filtrar por alertas")).toHaveText("Com alertas");

    await expect(page.getByText(/\d+ registro/)).toBeVisible();

    const cards = page.locator("a[href^='/children/']");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).locator("svg").first()).toBeVisible();
    }
  });

  test("filter by 'Revisados' shows only reviewed children", async ({ page }) => {
    await page.getByLabel("Filtrar por revisão").click();
    await expect(page.getByLabel("Filtrar por revisão")).toHaveText("Revisados");

    await expect(page.getByText(/\d+ registro/)).toBeVisible();
    const cards = page.locator("a[href^='/children/']");
    await expect(cards).not.toHaveCount(0);
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("pagination navigates to page 2", async ({ page }) => {
    await expect(page.getByText(/Página 1 de/)).toBeVisible();

    await page.getByLabel("Próxima página").click();

    await expect(page.getByText(/Página 2 de/)).toBeVisible();
  });

  test("clicking a child card navigates to the detail page", async ({ page }) => {
    const firstCard = page.locator("a[href^='/children/']").first();
    const href = await firstCard.getAttribute("href");
    await firstCard.click();

    await expect(page).toHaveURL(href!);
    await expect(page.locator("h1")).toBeVisible();
  });
});
