import { execSync } from "child_process";
import path from "path";

const ROOT = path.resolve(__dirname, "..");
const BACKEND_URL = "http://localhost:8080";
const FRONTEND_URL = "http://localhost:3000";
const TIMEOUT_MS = 120_000;

export default async function globalSetup() {
  if (process.env.SKIP_DB_RESET !== "true") {
    console.log("[setup] Resetting Docker Compose stack...");
    execSync("docker compose down -v", { cwd: ROOT, stdio: "inherit" });
    execSync("docker compose up -d", { cwd: ROOT, stdio: "inherit" });
    console.log("[setup] Stack started, waiting for backend...");
  } else {
    console.log("[setup] Skipping DB reset (SKIP_DB_RESET=true)");
  }

  await waitForBackend();
  console.log("[setup] Backend is ready.");
  await waitForFrontend();
  console.log("[setup] Frontend is ready.");
}

async function waitForFrontend(): Promise<void> {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(FRONTEND_URL);
      if (res.status === 200) return;
    } catch {
      // frontend not ready yet
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Frontend at ${FRONTEND_URL} did not become ready within ${TIMEOUT_MS}ms`);
}

async function waitForBackend(): Promise<void> {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "tecnico@prefeitura.rio",
          password: "painel@2024",
        }),
      });
      if (res.status === 200) return;
    } catch {
      // backend not ready yet
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Backend at ${BACKEND_URL} did not become ready within ${TIMEOUT_MS}ms`);
}
