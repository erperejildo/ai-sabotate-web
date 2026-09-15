import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "list" : "list",
  use: {
    baseURL: process.env.SITE_URL || "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.SITE_URL
    ? undefined
    : {
        command: "python3 -m http.server 4173 --bind 127.0.0.1",
        port: 4173,
        timeout: 30_000,
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
