import { test, expect } from "@playwright/test";

const CREDENTIALS = {
  email: "tecnico@prefeitura.rio",
  password: "painel@2024",
};

test.describe("Authentication", () => {
  test("unauthenticated visit to / redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated visit to /children redirects to /login", async ({ page }) => {
    await page.goto("/children");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login with wrong credentials shows error message", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("wrong@example.com");
    await page.getByLabel("Senha").fill("wrongpassword");
    await page.getByRole("button", { name: "Entrar" }).click();

    const alert = page.getByRole("alert").filter({ hasText: "Credenciais" });
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Credenciais inválidas");
  });

  test("login with correct credentials redirects to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(CREDENTIALS.email);
    await page.getByLabel("Senha").fill(CREDENTIALS.password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("authenticated user visiting /login is redirected to /", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(CREDENTIALS.email);
    await page.getByLabel("Senha").fill(CREDENTIALS.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("/");

    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });
});
