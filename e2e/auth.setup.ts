import { test as setup } from "@playwright/test";
import path from "path";
import fs from "fs";

const AUTH_FILE = path.join(__dirname, ".auth/state.json");

setup("save authenticated session", async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  await page.goto("/login");
  await page.getByLabel("E-mail").fill("tecnico@prefeitura.rio");
  await page.getByLabel("Senha").fill("painel@2024");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("/");

  await page.context().storageState({ path: AUTH_FILE });
});
