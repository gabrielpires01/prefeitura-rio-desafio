import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    globalSetup: "./global-setup.ts",
    testDir: "./tests",
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: "list",

    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
    },

    projects: [
        {
            name: "setup",
            testDir: ".",
            testMatch: /auth\.setup\.ts/,
        },
        {
            name: "unauthenticated",
            testMatch: /auth\.spec\.ts/,
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "authenticated",
            testMatch: /(dashboard|children|child-detail)\.spec\.ts/,
            dependencies: ["setup"],
            use: {
                ...devices["Desktop Chrome"],
                storageState: ".auth/state.json",
            },
        },
    ],
});
